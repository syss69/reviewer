import { Test, TestingModule } from '@nestjs/testing';
import { AmazonGlobalController } from './amazon-global.controller';

describe('AmazonGlobalController', () => {
  let controller: AmazonGlobalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmazonGlobalController],
    }).compile();

    controller = module.get<AmazonGlobalController>(AmazonGlobalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
