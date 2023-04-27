import { TestBed } from '@angular/core/testing';

import { WwChatService } from './ww-chat.service';

describe('WwChatService', () => {
  let service: WwChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WwChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
