import { TestBed } from '@angular/core/testing';

import { PathTravelGuard } from './path-travel.guard';

describe('PathTravelGuard', () => {
  let guard: PathTravelGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PathTravelGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
