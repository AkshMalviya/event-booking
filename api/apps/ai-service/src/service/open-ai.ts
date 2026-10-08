import OpenAI from 'openai';
import { config } from 'dotenv';
import * as path from 'node:path';

config({ path: path.resolve(process.cwd(), 'apps/ai-service/.env') });

export const OPEN_AI_CONFIGS = {
  LLM_BASE_URL: 'https://api.groq.com/openai/v1',
  LLM_MODEL: 'qwen/qwen3.8-27b',
};

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy',
  baseURL: OPEN_AI_CONFIGS.LLM_BASE_URL,
});
