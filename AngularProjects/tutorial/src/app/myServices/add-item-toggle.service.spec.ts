import { TestBed } from '@angular/core/testing';

import { AddItemToggleService } from './add-item-toggle.service';

describe('AddItemToggleService', () => {
  let service: AddItemToggleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddItemToggleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
