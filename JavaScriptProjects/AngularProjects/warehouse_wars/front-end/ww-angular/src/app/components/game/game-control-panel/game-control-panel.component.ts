import { Component } from '@angular/core';
import { RoomService, GameMovement, Direction } from 'src/app/services/game/room.service';

@Component({
  selector: 'ww-game-control-panel',
  templateUrl: './game-control-panel.component.html',
  styleUrls: ['./game-control-panel.component.css']
})
export class GameControlPanelComponent {
  onSrc: string = 'assets/game/toggle-on.gif';
  onAlt: string = '⤟';

  offSrc: string = 'assets/game/toggle-off.gif';
  offAlt: string = '⭲';

  toggle: boolean;
  dir = GameMovement;

  constructor (private room: RoomService){ 
    this.toggle = this.room.specialAction; 
  }

  sendControl (move: Direction){ this.room.sendControl(move); }
  specialActionToggle (){ this.toggle = this.room.specialActionToggle(); }
}
