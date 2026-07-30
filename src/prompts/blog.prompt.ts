import { Language, Languages } from '../common/languages';
import { ProductDto } from '../common/dto/product.dto';

export function buildBlogPrompt(
  product: ProductDto,
  language: Language,
): string {
  const languageLabel = Languages[language];

  return `
You are a professional product review blogger and content creator.

Write a detailed, positive, and engaging product review of approximately 500 words in ${languageLabel}.

Product Information:
- Product Name: ${product.title}
- Price: ${product.price}
- Description: ${product.description}

Requirements:
- Use a natural, human-like blogging style.
- Start with an engaging introduction about the product.
- Highlight the main advantages and standout features of the product.
- Explain what makes the product useful, convenient, or valuable.
- Mention who this product is ideal for and in what situations it works best.
- Include personal-style impressions and positive user experience examples.
- Keep the tone enthusiastic but believable.
- End with a strong final opinion and recommendation.
- Avoid sounding overly robotic or repetitive.

The review should feel authentic, modern, and suitable for a product review blog or e-commerce website.
`.trim();
}
