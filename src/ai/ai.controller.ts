import { Body, Controller, Post } from '@nestjs/common';
import { GenerateReviewDto } from './dto/generate-review.dto';
import { ReviewService } from './review.service';
import { BasicReviewDto } from './dto/basic-review.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly reviewService: ReviewService) {}
//test
  @Post()
  async generateReview(@Body() body: GenerateReviewDto) {
    return this.reviewService.generateFromUrl(body);
  }

  @Post('simple')
  async generateSimpleReview(@Body() body: BasicReviewDto) {
    return this.reviewService.generateSimpleReview(body);
  }
}
