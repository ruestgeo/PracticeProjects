import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from 'src/app/components/chat/chat.component';
import { LoginComponent } from 'src/app/components/login/login.component';
import { LobbyComponent } from 'src/app/components/lobby/lobby.component';
import { WaitingRoomComponent } from 'src/app/components/waiting-room/waiting-room.component';
import { GameComponent } from 'src/app/components/game/game.component';

import { PathTravelGuard,canActivateRoute } from 'src/app/routing/guards/path-travel.guard';



const routes: Routes = [
  {path: 'chat', title: 'WW Chat', component: ChatComponent, canActivate: [canActivateRoute]},
  {path: 'login', title: 'WW Login', component: LoginComponent, canActivate: [canActivateRoute]},
  {path: 'lobby', title: 'WW Lobby', component: LobbyComponent, canActivate: [canActivateRoute]},
  {path: 'waiting', title: 'WW Waiting Room', component: WaitingRoomComponent, canActivate: [canActivateRoute]},
  {path: 'game', title: 'WW Game Room', component: GameComponent, canActivate: [canActivateRoute]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
