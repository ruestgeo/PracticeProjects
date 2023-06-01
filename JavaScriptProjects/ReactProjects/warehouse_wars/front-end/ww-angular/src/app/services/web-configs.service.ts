import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, timeout } from 'rxjs';



const configsPath = "assets/configs/configs.json";


@Injectable({
  providedIn: 'root'
})
export class WebConfigsService {
  
  private _address: string = "localhost";
  private _port: number = 4200;
  private _configs: any = {};

  public get address (): string { return this._address; }
  public get port (): number { return this._port; }

  private subject: Subject<boolean> = new Subject<boolean>();
  public observable: Observable<boolean> = this.subject.asObservable();


  constructor(private http: HttpClient) { 
    this.http.get(configsPath, {responseType: 'json'})
    .pipe(timeout(5000))
    .subscribe({
      next: (configs) => {
        this._configs = configs;
        this.readConfigs();
        this.subject.next(true);
        this.subject.complete();
      }, 
      error: (error) => {
        console.error(error);
        this.subject.next(false);
        this.subject.complete();
      },
      complete: () => {
        this.subject.complete();
      }
    });
  }

  private readConfigs () {
    if (this._configs.hasOwnProperty("address")){
      //console.log(this._configs["address"]);
      this._address = this._configs["address"] == "0.0.0.0" ? "localhost" : this._configs["address"];
    }
      
    if (this._configs.hasOwnProperty("port")){
      //console.log(this._configs["port"]);
      this._port = parseInt(this._configs["port"]);
    }
  }
}
