import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dev';

  constructor(private router:Router){}
  nav(path: string){
    this.router.navigate([path]);
  }
}
