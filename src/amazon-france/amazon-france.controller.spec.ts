import { Test, TestingModule } from '@nestjs/testing';
import { AmazonFranceController } from './amazon-france.controller';
import { AmazonFranceParser } from '../parsers/amazonFrance.parser';

describe('AmazonFranceController', () => {
  let controller: AmazonFranceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmazonFranceController],
      providers: [
        {
          provide: AmazonFranceParser,
          useValue: { parse: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AmazonFranceController>(AmazonFranceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
