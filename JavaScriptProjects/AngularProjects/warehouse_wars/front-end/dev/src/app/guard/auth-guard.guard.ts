import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {

  validPathTravel: {[path:string]: string[]} = {
    '': ['a','b'],
    'a': ['b'],
    'b': ['a', '']
  }


  constructor(private router: Router) { }
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean|UrlTree>  |  Promise<boolean|UrlTree>  |  boolean  |  UrlTree 
  {
    /*
    route.url.map().join() === state.url
     */

    let current = this.trim(this.router.url);
    let _next = route.url.map(seg => seg.path).join('/');
    let next = this.trim(_next);
    console.log(`current :   ${current}  |  ${this.router.url}\nnext :   ${next}  |  ${_next}  |  ${route.url}\nroute string: ${route.toString()}\nstate url: ${state.url}\nstate root:  ${state.root}\nstate string:  ${state.toString()}`);
    if (this.validPathTravel.hasOwnProperty(current) && this.validPathTravel[current].includes(next)) return true;
    return false;
    //return true;
  }
  

  trim (path: string): string {
    if (path.startsWith('/') || path.startsWith('\\'))
    path = path.substring(1);
    if (path.endsWith('/') || path.endsWith('\\'))
      path = path.substring(0, path.length-1);
    return path;
  }
}
