import { getLanguageLabel } from '../common/constants/language-labels';
import { ProductDto } from '../common/dto/product.dto';
import { Languages } from '../common/enums/languages.enum';

export function buildReviewPrompt(product: ProductDto, language: Languages): string {
  const languageLabel = getLanguageLabel(language);

  return `
You are a product reviewer.

Product:
${product.title}

Price:
${product.price}

Description:
${product.description}

Write a positive testimonial text of approximately 150 words in ${languageLabel}.
Highlight the product's advantages, who it's suitable for,
and your final recommendation.
`.trim();
}
