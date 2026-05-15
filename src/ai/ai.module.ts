import { Module } from '@nestjs/common';
import { AmazonFranceModule } from '../amazon-france/amazon-france.module';
import { AmazonGlobalModule } from '../amazon-global/amazon-global.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ParserRegistryService } from './parser-registry.service';
import { ReviewService } from './review.service';

@Module({
  imports: [AmazonFranceModule, AmazonGlobalModule],
  controllers: [AiController],
  providers: [AiService, ReviewService, ParserRegistryService],
})
export class AiModule {}
