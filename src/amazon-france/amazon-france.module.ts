import { Module } from '@nestjs/common';
import { AmazonFranceController } from './amazon-france.controller';
import { AmazonFranceParser } from '../parsers/amazonFrance.parser';

@Module({
  controllers: [AmazonFranceController],
  providers: [AmazonFranceParser],
})
export class AmazonFranceModule {}
