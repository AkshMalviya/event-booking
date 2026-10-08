import { Module } from '@nestjs/common';
import { AiResolver } from './ai.resolver';

@Module({
  providers: [AiResolver],
})
export class AiModule {}
