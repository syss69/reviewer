import { Body, Controller, Post } from '@nestjs/common';
import { GenerateReviewDto } from './dto/generate-review.dto';
import { ReviewService } from './review.service';

@Controller('ai')
export class AiController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async generateReview(@Body() body: GenerateReviewDto) {
    return this.reviewService.generateFromUrl(body);
  }
}
