import { BadRequestException, Injectable } from '@nestjs/common';
import { Marketplace } from '../common/enums/marketplace.enum';
import { ProductParser } from '../common/interfaces/product-parser.interface';
import { AmazonFranceParser } from '../parsers/amazonFrance.parser';
import { AmazonGlobalParser } from '../parsers/amazonGlobal.parser';

@Injectable()
export class ParserRegistryService {
  constructor(
    private readonly amazonFranceParser: AmazonFranceParser,
    private readonly amazonGlobalParser: AmazonGlobalParser,
  ) {}

  getParser(marketplace: Marketplace): ProductParser {
    switch (marketplace) {
      case Marketplace.AMAZON_FRANCE:
        return this.amazonFranceParser;
      case Marketplace.AMAZON_GLOBAL:
        return this.amazonGlobalParser;
      default:
        throw new BadRequestException(`Unsupported marketplace: ${marketplace}`);
    }
  }
}
