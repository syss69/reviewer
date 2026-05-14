import { Test, TestingModule } from '@nestjs/testing';
import { AmazonFranceController } from './amazon-france.controller';

describe('AmazonFranceController', () => {
  let controller: AmazonFranceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmazonFranceController],
    }).compile();

    controller = module.get<AmazonFranceController>(AmazonFranceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
