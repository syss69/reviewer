import { Controller, Body, Post } from '@nestjs/common';
import { WildberriesParser } from '../parsers/wildberries.parser';

@Controller('wildberries')
export class WildberriesController {
  constructor(private readonly wildberriesParser: WildberriesParser) {}

  @Post()
  async parse(@Body() body: { url: string }) {
    return this.wildberriesParser.parse(body.url);
  }
}
