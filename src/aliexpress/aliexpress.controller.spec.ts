import { Test, TestingModule } from '@nestjs/testing';
import { AliexpressController } from './aliexpress.controller';

describe('AliexpressController', () => {
  let controller: AliexpressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AliexpressController],
    }).compile();

    controller = module.get<AliexpressController>(AliexpressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
