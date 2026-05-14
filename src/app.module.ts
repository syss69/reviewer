import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AmazonFranceModule } from './amazon-france/amazon-france.module';

@Module({
  imports: [AmazonFranceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
