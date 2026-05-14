import { Module } from '@nestjs/common';
import { AmazonFranceController } from './amazon-france.controller';
import { AmazonFranceParser } from '../parser/amazonFrance.parser';

@Module({
  controllers: [AmazonFranceController],
  providers: [AmazonFranceParser],
})
export class AmazonFranceModule {}
