import { Test, TestingModule } from '@nestjs/testing';
import { RadioCallsService } from './radio-calls.service';

describe('RadioCallsService', () => {
  let service: RadioCallsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RadioCallsService],
    }).compile();

    service = module.get<RadioCallsService>(RadioCallsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
