import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
//import { ITEMS } from 'src/app/my-example-items';
import {Item} from 'src/app/Item'

@Injectable({
  providedIn: 'root'
})
export class ElementService {
  private api_url: string = "http://localhost:3000/items";

  constructor (private http: HttpClient) { }

  getItems (): Observable<Item[]> {
    //let result = ITEMS;
    //let result = of(ITEMS);
    let result = this.http.get<Item[]>(this.api_url);
    return result;
  }

  deleteItem (item: Item): Observable<Item> {
    //delete with url param
    //return this.http.delete<Item>(`${this.api_url}/${item.id}`);

    //delete with req body
    return this.http.delete<Item>(`${this.api_url}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: item //JSON.stringify(item)
    });
  }

  updateItem (itemPartial: Item): Observable<Item> {
    let result = this.http.put<Item>(`${this.api_url}`, itemPartial, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    });
    return result;
  }

  createItem (itemPrototype: Item): Observable<Item> {
    itemPrototype.id = -1;
    let result = this.http.post<Item>(`${this.api_url}`, itemPrototype, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }) 
    });
    return result;
  }
}
