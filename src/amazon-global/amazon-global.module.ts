import { Module } from '@nestjs/common';
import { AmazonGlobalController } from './amazon-global.controller';
import { AmazonGlobalParser } from '../parsers/amazonGlobal.parser';

@Module({
  controllers: [AmazonGlobalController],
  providers: [AmazonGlobalParser],
  exports: [AmazonGlobalParser],
})
export class AmazonGlobalModule {}
