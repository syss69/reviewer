import { Test, TestingModule } from '@nestjs/testing';
import { AmazonGlobalController } from './amazon-global.controller';
import { AmazonGlobalParser } from '../parsers/amazonGlobal.parser';

describe('AmazonGlobalController', () => {
  let controller: AmazonGlobalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmazonGlobalController],
      providers: [
        {
          provide: AmazonGlobalParser,
          useValue: { parse: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AmazonGlobalController>(AmazonGlobalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
