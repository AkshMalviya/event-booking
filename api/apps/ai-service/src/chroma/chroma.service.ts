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
import { firstValueFrom, timeout } from 'rxjs';

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

    // Index existing events into ChromaDB on startup
    void this.addEventIndex();
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
          slug: (event as any).slug ?? '',
          description: ((event as any).description ?? '').slice(0, 300),
          price: Number((event as any).price ?? 0),
          startDate: (event as any).startDate
            ? String((event as any).startDate)
            : '',
          endDate: (event as any).endDate ? String((event as any).endDate) : '',
        },
      ],
    });
    return { message: 'Event stored successfully' };
  }

  async addEventIndex() {
    try {
      const allEvents: PaginatedEvents = await firstValueFrom(
        this.eventClient
          .send(EVENT_PATTERNS.FIND_ALL, {
            limit: 100,
          } as EventQueryDto)
          .pipe(timeout(5000)),
      );

      if (!allEvents?.data?.length) {
        console.log('No events found to index');
        return [];
      }

      const result = await Promise.all(
        allEvents.data.map((e) =>
          this.addEvent(e.id || (e as any)._id?.toString(), e),
        ),
      );

      console.log(`Successfully indexed ${result.length} events into ChromaDB`);
      return result;
    } catch (err) {
      console.warn(
        'Failed to index events in ChromaDB:',
        (err as Error).message,
      );
      return [];
    }
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

      const DISTANCE_THRESHOLD = 1.5;

      const matchedIds = ids.filter((_, idx) => {
        const dist = distances[idx];
        return dist !== undefined && dist <= DISTANCE_THRESHOLD;
      });

      return matchedIds;
    } catch (error) {
      console.error('Vector search failed in Chroma:', error);
      return [];
    }
  }

  async searchEventsDetailed(query: string, limit = 5): Promise<any[]> {
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
      const metadatas = results.metadatas?.[0] || [];
      const distances = results.distances?.[0] || [];

      const matchedEvents: any[] = [];

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const dist = distances[i];
        if (dist !== undefined && dist > 1.5) {
          continue;
        }

        try {
          const fullEvent: any = await firstValueFrom(
            this.eventClient
              .send(EVENT_PATTERNS.FIND_ONE, { eventId: id })
              .pipe(timeout(2500)),
          );
          if (fullEvent) {
            matchedEvents.push({
              id: fullEvent.id || fullEvent._id?.toString() || id,
              title: fullEvent.title,
              slug: fullEvent.slug || id,
              description: fullEvent.description,
              startDate: fullEvent.startDate,
              endDate: fullEvent.endDate,
              price: fullEvent.price,
              availableSeats: fullEvent.availableSeats,
              tags: fullEvent.tags,
            });
            continue;
          }
        } catch {
          // If FIND_ONE fails or times out, fall back to metadata
        }

        const meta: any = metadatas[i] || {};
        matchedEvents.push({
          id,
          title: meta.title || 'Event',
          slug: meta.slug || id,
          description: meta.description || '',
          startDate: meta.startDate || '',
          endDate: meta.endDate || '',
          price: Number(meta.price || 0),
        });
      }

      if (matchedEvents.length > 0) {
        return matchedEvents;
      }
    } catch (err) {
      console.warn('Chroma vector search error:', err);
    }

    // Fallback: Query EVENT_SERVICE directly with search query
    try {
      const res: PaginatedEvents = await firstValueFrom(
        this.eventClient
          .send(EVENT_PATTERNS.FIND_ALL, {
            search: query,
            limit,
          } as EventQueryDto)
          .pipe(timeout(3000)),
      );
      if (res?.data?.length) {
        return res.data.map((e) => ({
          id: e.id || (e as any)._id?.toString(),
          title: e.title,
          slug: e.slug || e.id,
          description: e.description,
          startDate: e.startDate,
          endDate: e.endDate,
          price: e.price,
          availableSeats: e.availableSeats,
          tags: e.tags,
        }));
      }
    } catch (fallbackErr) {
      console.warn('Fallback event search error:', fallbackErr);
    }

    return [];
  }
}
