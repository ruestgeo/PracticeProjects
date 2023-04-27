import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameControlPanelComponent } from './game-control-panel.component';

describe('GameControlPanelComponent', () => {
  let component: GameControlPanelComponent;
  let fixture: ComponentFixture<GameControlPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameControlPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameControlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
