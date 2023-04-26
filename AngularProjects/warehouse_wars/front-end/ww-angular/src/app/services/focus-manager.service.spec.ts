import { TestBed } from '@angular/core/testing';

import { FocusManagerService } from './focus-manager.service';

describe('FocusManagerService', () => {
  let service: FocusManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FocusManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
