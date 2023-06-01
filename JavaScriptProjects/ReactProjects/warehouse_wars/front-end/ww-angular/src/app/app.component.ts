import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ClientService } from 'src/app/services/game/client/client.service';
import { WebConfigsService } from './services/web-configs.service';




@Component({
  selector: 'ww-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loaded: boolean = false;
  error: boolean = false;
  errorMessage: string = '';

  state: AppState = AppState.default;
  states: typeof AppState = AppState;
  timeout: NodeJS.Timeout | null = null;

  socketError: Subscription | undefined;
  socketOpen: Subscription | undefined;

  private subscriptions: Subscription[] = [];



  constructor (private client: ClientService, private router: Router, 
    private configs: WebConfigsService){}



  ngOnInit (){
    this.init();
  }


  ngOnDestroy() {
    for (let sub of this.subscriptions){
      sub.unsubscribe();
    }
    this.subscriptions = [];
    this.client.onFinishedWaiting();
  }


  connect (){
    this.loaded = false;
    this.error = false;
    this.errorMessage = '';
    this.client.connect();
  }


  //if redirect to root, run this function
  init () {
    console.log('__init root__');
    this.socketError = this.client.socketError.subscribe((err) => {
      this.state = AppState.error;
      this.errorMessage = `Failed to connect. Please reload or retry\n${err.message}`;
    });

    this.socketOpen = this.client.socketIsOpenObservable.subscribe((isOpen) => {
      if (isOpen){
        this.client.onFinishedWaiting();
        this.state = AppState.connected;
        this.timeout = setTimeout((_this) => {_this.state = AppState.default; _this.timeout = null;}, 2000, this);
        this.errorMessage = '';
        this.socketError?.unsubscribe();
        this.socketOpen?.unsubscribe();
        this.router.navigate(['login']);
      } 
    });

    this.state = AppState.connecting;
    this.client.onWaiting();
    
    this.configs.observable.subscribe({
      complete: () => this.connect()
    });
    
  }
}


enum AppState {
  'default',
  'connecting',
  'connected',
  'error'
}