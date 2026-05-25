import { Module } from '@nestjs/common';
import { AliExpressParser } from '../parsers/aliexpress.parser';
import { AliexpressController } from './aliexpress.controller';

@Module({
  controllers: [AliexpressController],
  providers: [AliExpressParser],
  exports: [AliExpressParser],
})
export class AliexpressModule {}