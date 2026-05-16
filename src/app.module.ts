import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AmazonFranceModule } from './amazon-france/amazon-france.module';
import { AmazonGlobalModule } from './amazon-global/amazon-global.module';
import { AiModule } from './ai/ai.module';
import { PlaywrightModule } from './playwright/playwright.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PlaywrightModule,
    AmazonFranceModule,
    AmazonGlobalModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
