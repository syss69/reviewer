import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AmazonFranceModule } from './amazon-france/amazon-france.module';
import { AmazonGlobalModule } from './amazon-global/amazon-global.module';

@Module({
  imports: [AmazonFranceModule, AmazonGlobalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
