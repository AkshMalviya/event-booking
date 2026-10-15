import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient } from 'chromadb';
import {
  pipeline,
  env,
  FeatureExtractionPipeline,
} from '@huggingface/transformers';
import {
  EventEntity,
  PaginatedEvents,
} from '@app/contracts/events/event.entity';
import { ClientKafka } from '@nestjs/microservices';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import {
  EventQueryDto,
  EventTimeline,
} from '@app/contracts/events/event-query.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChromaService implements OnModuleInit {
  private readonly client: ChromaClient;
  private extractor: FeatureExtractionPipeline;

  constructor(
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientKafka,
  ) {
    this.client = new ChromaClient({
      host: process.env.CHROMA_HOST || 'localhost',
      port: Number(process.env.CHROMA_PORT || 8000),
    });
  }

  async onModuleInit() {
    Object.values(EVENT_PATTERNS).forEach((pattern) => {
      this.eventClient.subscribeToResponseOf(pattern);
    });
    try {
      await this.client.heartbeat();
      console.log('ChromaDB connected successfully');
    } catch (error) {
      console.error('ChromaDB connection failed:', error);
    }

    try {
      env.allowLocalModels = true;

      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
      );

      console.log('Embedding model loaded successfully');
    } catch (e) {
      console.error('Embedding Model failed:', e);
    }
    await this.eventClient.connect();
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data as Float32Array);
  }

  async getEventsCollection() {
    return this.client.getOrCreateCollection({
      name: 'events',
      embeddingFunction: {
        generate: async (texts: string[]) => {
          return Promise.all(texts.map((t) => this.generateEmbedding(t)));
        },
      },
    });
  }

  async addEvent(eventId: string, event: Partial<EventEntity>) {
    const collection = await this.getEventsCollection();

    const text = [event.title, event.description, ...(event.tags ?? [])]
      .filter(Boolean)
      .join('. ');

    const embedding = await this.generateEmbedding(text);

    await collection.upsert({
      ids: [eventId],
      documents: [text],
      embeddings: [embedding],
      metadatas: [
        {
          title: event.title ?? 'New Event',
        },
      ],
    });
    return { message: 'Event stored successfully' };
  }

  async addEventIndex() {
    const onGoingEvent: PaginatedEvents = await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.FIND_ALL, {
        limit: 10,
        timeline: EventTimeline.ONGOING,
      } as EventQueryDto),
    );

    if (!onGoingEvent?.data?.length) {
      return [];
    }

    const result = await Promise.all(
      onGoingEvent.data.map((e) =>
        this.addEvent(e.id || (e as any)._id?.toString(), e),
      ),
    );

    return result;
  }

  async searchSimilarEvents(query: string, limit = 10): Promise<string[]> {
    if (!query?.trim()) {
      return [];
    }

    try {
      const collection = await this.getEventsCollection();
      const embedding = await this.generateEmbedding(query);

      const results = await collection.query({
        queryEmbeddings: [embedding],
        nResults: limit,
      });

      const ids = results.ids?.[0] || [];
      const distances = results.distances?.[0] || [];

      const DISTANCE_THRESHOLD = 1.3;

      const matchedIds = ids.filter((_, idx) => {
        const dist = distances[idx];
        return dist !== undefined && dist && dist <= DISTANCE_THRESHOLD;
      });

      return matchedIds;
    } catch (error) {
      console.error('Vector search failed in Chroma:', error);
      return [];
    }
  }
}
