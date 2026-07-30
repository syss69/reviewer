import { Module } from '@nestjs/common';
import { WildberriesController } from './wildberries.controller';
import { WildberriesParser } from '../parsers/wildberries.parser';

@Module({
  controllers: [WildberriesController],
  providers: [WildberriesParser],
  exports: [WildberriesParser],
})
export class WildberriesModule {}
