import { Controller, Body, Post } from '@nestjs/common';
import { AliExpressParser } from '../parsers/aliexpress.parser';

@Controller('aliexpress')
export class AliexpressController {
    constructor(
        private readonly aliExpressParser: AliExpressParser
    ) {}

    @Post()
    async parse(@Body() body: { url: string }) {
        return this.aliExpressParser.parse(body.url);
    }
}
