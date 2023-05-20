import { TestBed } from '@angular/core/testing';

import { WebConfigsService } from './web-configs.service';

describe('WebConfigsService', () => {
  let service: WebConfigsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebConfigsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
