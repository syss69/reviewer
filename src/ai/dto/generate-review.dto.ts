import { Language } from '../../common/languages';
import { Marketplace } from '../../common/enums/marketplace.enum';

export class GenerateReviewDto {
  url: string;
  marketplace: Marketplace;
  prompt: string;
  language: Language;
}
