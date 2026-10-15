import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { EventDraft } from '../../schema/chat.schema';

export interface GenerateImageParams {
  prompt: string;
  style?: string;
  userId?: string | null;
  conversationId?: string;
  currentDraft?: EventDraft | null;
}

export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  remaining?: number;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  festival:
    'https://images.unsplash.com/photo-1605194000384-439c3ced8d15?auto=format&fit=crop&w=1280&h=720&q=80',
  garba:
    'https://images.unsplash.com/photo-1605029271330-95970e826af3?auto=format&fit=crop&w=1280&h=720&q=80',
  music:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1280&h=720&q=80',
  tech:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1280&h=720&q=80',
  party:
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1280&h=720&q=80',
  sports:
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1280&h=720&q=80',
  default:
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1280&h=720&q=80',
};

@Injectable()
export class ImageGenerationService {
  private readonly logger = new Logger(ImageGenerationService.name);
  private readonly DAILY_LIMIT = 10;

  constructor(private readonly redisService: RedisService) {}

  /**
   * Check and increment the user's daily image generation rate limit in Redis.
   */
  async checkRateLimit(
    userId?: string | null,
    conversationId?: string,
  ): Promise<{ allowed: boolean; remaining: number; error?: string }> {
    const redis = this.redisService.getClient();
    const identifier = userId || conversationId || 'anonymous';
    const rateLimitKey = `ratelimit:image-generation:${identifier}`;

    try {
      const current = await redis.incr(rateLimitKey);
      if (current === 1) {
        // Set 24 hour TTL on first request
        await redis.expire(rateLimitKey, 86400);
      }

      const remaining = Math.max(0, this.DAILY_LIMIT - current);

      if (current > this.DAILY_LIMIT) {
        return {
          allowed: false,
          remaining: 0,
          error: `Daily limit of ${this.DAILY_LIMIT} free image generations reached. Please try again tomorrow.`,
        };
      }

      return {
        allowed: true,
        remaining,
      };
    } catch (err) {
      this.logger.warn(
        `Failed to check image generation rate limit: ${(err as Error).message}`,
      );
      // Graceful fallback: allow generation if Redis rate limit check fails
      return { allowed: true, remaining: this.DAILY_LIMIT - 1 };
    }
  }

  /**
   * Generate an event poster/banner image using high-definition 1280x720 photography.
   * Completely free, fast, zero paywalls.
   */
  async generateImage(
    params: GenerateImageParams,
  ): Promise<GenerateImageResult> {
    const { prompt, style, userId, conversationId, currentDraft } = params;

    // 1. Rate limiting check
    const rateCheck = await this.checkRateLimit(userId, conversationId);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: rateCheck.error,
        remaining: 0,
      };
    }

    try {
      // 2. Extract clean visual keywords from prompt and draft details
      const cleanPromptWords = prompt
        .replace(/["']/g, '')
        .replace(
          /\b(event banner for|banner for|poster for|title|text|generate image|create image|image|poster|banner)\b/gi,
          '',
        )
        .trim();

      const searchTerms = [
        currentDraft?.title ? currentDraft.title.replace(/["']/g, '') : '',
        cleanPromptWords,
        currentDraft?.tags || '',
        style || '',
      ]
        .filter(Boolean)
        .join(' ');

      const query = (searchTerms || 'event celebration festival').slice(0, 100);

      this.logger.log(`Searching HD event banner for query: "${query}"`);

      let imageUrl: string | null = null;

      try {
        const response = await fetch(
          `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=10`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'application/json',
            },
          },
        );

        if (response.ok) {
          const data = (await response.json()) as {
            results?: Array<{
              urls?: { raw?: string; regular?: string };
            }>;
          };

          if (data.results && data.results.length > 0) {
            // Pick a randomized candidate from top results so regenerating gives variety
            const randomIndex = Math.floor(
              Math.random() * Math.min(data.results.length, 5),
            );
            const selected = data.results[randomIndex];
            const baseUrl = selected.urls?.raw || selected.urls?.regular;

            if (baseUrl) {
              const cleanBase = baseUrl.split('?')[0];
              imageUrl = `${cleanBase}?auto=format&fit=crop&w=1280&h=720&q=80`;
            }
          }
        }
      } catch (searchErr) {
        this.logger.warn(
          `Image search API failed: ${(searchErr as Error).message}`,
        );
      }

      // 3. Fallback to category banners if search yielded no results
      if (!imageUrl) {
        const lowerQuery = query.toLowerCase();
        let fallbackKey = 'default';
        for (const key of Object.keys(CATEGORY_FALLBACKS)) {
          if (lowerQuery.includes(key)) {
            fallbackKey = key;
            break;
          }
        }
        imageUrl =
          CATEGORY_FALLBACKS[fallbackKey] || CATEGORY_FALLBACKS.default;
      }

      this.logger.log(
        `Generated HD banner for conversation ${conversationId || 'new'}: ${imageUrl}`,
      );

      return {
        success: true,
        imageUrl,
        remaining: rateCheck.remaining,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to generate event image: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: 'Failed to generate event image. Please try again.',
        remaining: rateCheck.remaining,
      };
    }
  }
}
