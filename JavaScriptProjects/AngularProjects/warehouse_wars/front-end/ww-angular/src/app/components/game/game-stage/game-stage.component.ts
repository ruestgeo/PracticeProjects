import { Component } from '@angular/core';
import { RoomService } from 'src/app/services/game/room.service';
import { UserProfile } from 'src/app/types/User';
import { WWUserProfile } from 'src/app/types/WWUser';

@Component({
  selector: 'ww-game-stage',
  templateUrl: './game-stage.component.html',
  styleUrls: ['./game-stage.component.css']
})
export class GameStageComponent {
  constructor (private room: RoomService, private user: UserProfile /*injected as WWUserProfile*/){}

  get players (){ return this.room.players; }
  get hpStatus (){ return this.room.hpStatus; }
  get stage (){ return this.room.stage; }

  get ready (){ return this.room.ready; }
  get userId (){ return this.user.id; }
  get roomId (){ return this.room.id; }

  get imgs (){ return this.room.imgs; }
  get alts (){ return this.room.alts; }

  onReady (){ this.room.onReady(); }
}
