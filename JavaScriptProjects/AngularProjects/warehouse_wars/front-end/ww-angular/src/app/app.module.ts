import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './routing/app-routing.module';

import { AppComponent } from './app.component';
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameComponent } from './components/game/game.component';
import { ChatStatusInfoComponent } from './components/chat/chat-status-info/chat-status-info.component';
import { ChatEntryComponent } from './components/chat/chat-entry/chat-entry.component';

import { SpinnerComponent } from './_sourcedMaterial/spinner/spinner.component';
import { SpinnerOverlayComponent } from './_sourcedMaterial/spinner/spinner-overlay.component';

import { ChatStatusDirective } from './directives/chat/chat-status.directive';
import { ChatEntryDirective } from './directives/chat/chat-entry.directive';

import { CookieService } from 'ngx-cookie-service';

import { WwChatService } from './services/chat/ww/ww-chat.service';
import { ChatService } from './services/chat/common/chat.service';
import { ChatPackagerInterface } from './services/chat/common/ChatPackagerInterface';
import { WWChatPackager } from './services/chat/ww/WWChatPackager';
import { UserProfile } from './types/User';
import { WWUserProfile } from './types/WWUser';
import { GameInfoComponent } from './components/game/game-info/game-info.component';
import { GameControlPanelComponent } from './components/game/game-control-panel/game-control-panel.component';
import { GameStageComponent } from './components/game/game-stage/game-stage.component';




@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    LoginComponent,
    LobbyComponent,
    GameComponent,
    ChatStatusInfoComponent,
    ChatEntryComponent,

    SpinnerComponent,
    SpinnerOverlayComponent,
    
    ChatStatusDirective,
    ChatEntryDirective,
    GameInfoComponent,
    GameControlPanelComponent,
    GameStageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    CookieService,
    {provide: ChatPackagerInterface, useClass: WWChatPackager},
    {provide: ChatService, useClass: WwChatService},
    {provide: UserProfile, useClass: WWUserProfile}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
