import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameStageComponent } from './game-stage.component';

describe('GameStageComponent', () => {
  let component: GameStageComponent;
  let fixture: ComponentFixture<GameStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameStageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
