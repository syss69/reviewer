import { Controller , Body, Post} from '@nestjs/common';
import { AmazonFranceParser } from '../parsers/amazonFrance.parser';

@Controller('amazon-france')
export class AmazonFranceController {
    constructor(
        private readonly amazonFranceParser: AmazonFranceParser
    ) {}

    @Post()
    async parse(@Body() body: { url: string }) {
        return this.amazonFranceParser.parse(body.url);
    }
}
