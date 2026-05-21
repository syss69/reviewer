import { Test, TestingModule } from '@nestjs/testing';
import { WildberriesController } from './wildberries.controller';

describe('WildberriesController', () => {
  let controller: WildberriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WildberriesController],
    }).compile();

    controller = module.get<WildberriesController>(WildberriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
