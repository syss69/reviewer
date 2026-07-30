import { Controller, Post, Body } from '@nestjs/common';
import { AmazonGlobalParser } from '../parsers/amazonGlobal.parser';

@Controller('amazon-global')
export class AmazonGlobalController {
  constructor(private readonly amazonGlobalParser: AmazonGlobalParser) {}

  @Post()
  async parse(@Body() body: { url: string }) {
    return this.amazonGlobalParser.parse(body.url);
  }
}
