import { Language } from '../../common/languages';
import { ProductDto } from '../../common/dto/product.dto';

export class BasicReviewDto {
  product: ProductDto;
  language: Language;
  prompt: string;
}
