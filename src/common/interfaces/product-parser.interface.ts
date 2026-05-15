import { ProductDto } from '../dto/product.dto';

export interface ProductParser {
  parse(url: string): Promise<ProductDto>;
}
