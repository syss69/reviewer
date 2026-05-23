import { Injectable } from '@nestjs/common';
import { resolvePrompt } from '../prompts';
import { AiService } from './ai.service';
import { GenerateReviewDto } from './dto/generate-review.dto';
import { ParserRegistryService } from './parser-registry.service';
import { BasicReviewDto } from './dto/basic-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly parserRegistry: ParserRegistryService,
    private readonly aiService: AiService,
  ) {}

  async generateFromUrl(dto: GenerateReviewDto) {
    const parser = this.parserRegistry.getParser(dto.marketplace);
    const product = await parser.parse(dto.url);
    const promptBuilder = resolvePrompt(dto.prompt);
    const prompt = promptBuilder(product, dto.language);
    const review = await this.aiService.complete(prompt);
    return { product, review };
  }

  async generateSimpleReview(dto: BasicReviewDto) {
    const promptBuilder = resolvePrompt(dto.prompt);
    const prompt = promptBuilder(dto.product, dto.language);
    const review = await this.aiService.complete(prompt);
    return { review };
  }
}
