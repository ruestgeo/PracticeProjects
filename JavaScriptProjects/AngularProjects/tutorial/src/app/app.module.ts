import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './myComponents/header/header.component';
import { ButtonComponent } from './myComponents/button/button.component';
import { ItemsComponent } from './myComponents/items/items.component';
import { ItemComponent } from './myComponents/item/item.component';
import { AddItemComponent } from './myComponents/add-item/add-item.component';
import { MainComponent } from './myComponents/main/main.component';


const appRoutes: Routes = [
  {
    path: '',
    component: MainComponent
  },
  {
    path: 'add',
    component: AddItemComponent
  },
  {
    path: 'items',
    component: ItemsComponent
  },
]

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ButtonComponent,
    ItemsComponent,
    ItemComponent,
    AddItemComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
