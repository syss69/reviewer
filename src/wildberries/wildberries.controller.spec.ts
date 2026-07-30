import { Test, TestingModule } from '@nestjs/testing';
import { WildberriesController } from './wildberries.controller';
import { WildberriesParser } from '../parsers/wildberries.parser';

describe('WildberriesController', () => {
  let controller: WildberriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WildberriesController],
      providers: [
        {
          provide: WildberriesParser,
          useValue: { parse: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<WildberriesController>(WildberriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
