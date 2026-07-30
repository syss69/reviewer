import { Test, TestingModule } from '@nestjs/testing';
import { AliexpressController } from './aliexpress.controller';
import { AliExpressParser } from '../parsers/aliexpress.parser';

describe('AliexpressController', () => {
  let controller: AliexpressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AliexpressController],
      providers: [
        {
          provide: AliExpressParser,
          useValue: { parse: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AliexpressController>(AliexpressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
