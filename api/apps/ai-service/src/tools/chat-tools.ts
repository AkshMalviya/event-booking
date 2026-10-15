import { ChatCompletionTool } from 'openai/resources/index';

export const CREATE_EVENT_DRAFT_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'create_event_draft',
    description:
      'Create or update event details (title, description, dates, capacity, price, tags). Invoke when the user asks to plan, create, or modify text/date/price details of an event. Do NOT generate or change images with this function.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The event title',
        },
        description: {
          type: 'string',
          description:
            'A compelling, well-written 2-3 sentence description of the event',
        },
        capacity: {
          type: 'integer',
          description: 'The maximum number of attendees / available seats',
        },
        startDate: {
          type: 'string',
          description: 'The event start date in YYYY-MM-DD format',
        },
        endDate: {
          type: 'string',
          description:
            'The event end date in YYYY-MM-DD format. If duration is given (e.g. 2 days), compute endDate = startDate + duration.',
        },
        price: {
          type: 'integer',
          description:
            'The ticket price in Rupees (INR / ₹) as an integer (0 for free events)',
        },
        tags: {
          type: 'string',
          description:
            'Comma-separated keywords/tags relevant to the event (e.g. music, festival, outdoor)',
        },
      },
      required: ['title', 'description', 'capacity', 'startDate', 'endDate'],
      additionalProperties: false,
    },
  },
};

export const GENERATE_EVENT_IMAGE_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'generate_event_image',
    description:
      'Generate a promotional event poster or banner artwork. Invoke ONLY when the user explicitly requests an image, poster, banner, visual graphic, or picture (e.g. "generate a poster for this", "create an image", "make a banner"). NEVER invoke when the user is modifying the title, description, dates, or other event details.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description:
            'A descriptive, cinematic visual scene prompt describing the environment, mood, lighting, and subjects (e.g. "Warm festive celebration with hundreds of glowing golden diyas, marigold flowers, soft bokeh, warm stage lighting, cinematic photography"). Do NOT include words like "banner for", do NOT wrap titles in quotes, and do NOT request text or letters inside the image.',
        },
        style: {
          type: 'string',
          description:
            'Optional aesthetic style: "photographic", "cinematic", "digital-art", "neon", "minimalist", or "vintage".',
        },
      },
      required: ['prompt'],
      additionalProperties: false,
    },
  },
};

export const CHAT_TOOLS: ChatCompletionTool[] = [
  CREATE_EVENT_DRAFT_TOOL,
  GENERATE_EVENT_IMAGE_TOOL,
];
