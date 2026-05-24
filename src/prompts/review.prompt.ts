import { Language, Languages } from '../common/languages';
import { ProductDto } from '../common/dto/product.dto';

export function buildReviewPrompt(product: ProductDto, language: Language): string {
  const languageLabel = Languages[language];

  return `
You are a product reviewer.

Product:
${product.title}

Price:
${product.price}
${product.overview ? `\nCharacteristics:\n${product.overview}\n` : ''}
Description:
${product.description}

Write a positive testimonial text of approximately 150 words in ${languageLabel}.
Highlight the product's advantages, who it's suitable for,
and your final recommendation.
`.trim();
}
