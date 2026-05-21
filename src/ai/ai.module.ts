import { Module } from '@nestjs/common';
import { AmazonFranceModule } from '../amazon-france/amazon-france.module';
import { AmazonGlobalModule } from '../amazon-global/amazon-global.module';
import { AliexpressModule } from '../aliexpress/aliexpress.module';
import { WildberriesModule } from '../wildberries/wildberries.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ParserRegistryService } from './parser-registry.service';
import { ReviewService } from './review.service';

@Module({
  imports: [AmazonFranceModule, AmazonGlobalModule, AliexpressModule, WildberriesModule],
  controllers: [AiController],
  providers: [AiService, ReviewService, ParserRegistryService],
})
export class AiModule {}
