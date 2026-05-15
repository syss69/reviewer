import { Languages } from '../../common/enums/languages.enum';
import { Marketplace } from '../../common/enums/marketplace.enum';

export class GenerateReviewDto {
  url: string;
  marketplace: Marketplace;
  prompt: string;
  language: Languages; 
}
