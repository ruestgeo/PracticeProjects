import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatStatusInfoComponent } from './chat-status-info.component';

describe('ChatStatusInfoComponent', () => {
  let component: ChatStatusInfoComponent;
  let fixture: ComponentFixture<ChatStatusInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatStatusInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatStatusInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
