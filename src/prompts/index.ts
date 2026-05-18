import { Language } from '../common/languages';
import { ProductDto } from '../common/dto/product.dto';
import { buildBlogPrompt } from './blog.prompt';
import { buildReviewPrompt } from './review.prompt';

export type PromptBuilder = (product: ProductDto, language: Language) => string;

export const PROMPTS: Record<string, PromptBuilder> = {
  review: buildReviewPrompt,
  blog: buildBlogPrompt,
};

export function resolvePrompt(name: string): PromptBuilder {
  const builder = PROMPTS[name];
  if (!builder) {
    throw new Error(`Unknown prompt: ${name}`);
  }
  return builder;
}
