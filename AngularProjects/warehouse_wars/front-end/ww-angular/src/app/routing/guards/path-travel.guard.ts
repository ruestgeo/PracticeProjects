import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Route, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { PathEnum } from 'src/app/routing/PathEnum';


const defaultRedirect = ['login'];
const validPathTravel: {[currentPath: string]: /*nextPath*/ string[]} = {
  '': ['login'],
  'login': ['', 'lobby'],
  'lobby': ['', 'game', 'login'],
  'game': ['', 'lobby', 'login']
}
const pathAllowed: {[nextPath: string]: /*currentPath*/ string[]} = { 
  //not used, but can be used as either routing logic itself or to define validPathTravel 
  '': ['*'], //all single segment paths
  'login': ['**'], //all allowed
  'lobby': ['login', 'game'], 
  'game': ['lobby']
}
const allPaths: string[] = [];
const validChars: string = "A-Za-z0-9-";
/*
 * "*" matches any single path segment
 * "**" matches any chain of path segments
 */

const routeEmit: {[path:string]: PathEnum} = {
  '': PathEnum.root,
  'login': PathEnum.login,
  'lobby': PathEnum.lobby,
  'game': PathEnum.game,
}



export const canActivateRoute: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(PathTravelGuard).canActivate(route, state);
};




@Injectable({
  providedIn: 'root'
})
export class PathTravelGuard /*implements CanActivate*/ { 
  /*
    @deprecated
    Class-based Route guards are deprecated in favor of functional guards. 
    An injectable class can be used as a functional guard using the inject function: 
    canActivate: [() => inject(myGuard).canActivate()]
  */
  

  private routeSubject: BehaviorSubject<PathEnum> = new BehaviorSubject<PathEnum>(PathEnum.root);
  route: Observable<PathEnum> = this.routeSubject.asObservable();



  constructor(private router: Router) {
    for (let path of Object.keys(validPathTravel)){ //trim all paths
      let list = validPathTravel[path];
      delete validPathTravel[path];
      validPathTravel[this.trim(path)] = list.map(p => this.trim(p));
    }

    /* Alt
    allPaths = [];
    this.listAllPaths('', this.router.config);
    allPaths.map(path => this.trim(path));
    for (let path of Object.keys(pathAllowed)){ //trim all paths
      let list = pathAllowed[path];
      delete pathAllowed[path];
      pathAllowed[this.trim(path)] = list.map(p => this.trim(p));
    }
    */
    
    //Alt 2: example of use; dont use
    //this.setPathTravel();
  }
  


  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let current = this.trim(this.router.url, true);
    let next = this.trim(state.url, true);  //this.trim(route.url.map(seg => seg.path).join('/'), true);
    console.log(`navigate current :   [${current}]    next :   [${next}]`);
    if (validPathTravel.hasOwnProperty(current) && validPathTravel[current].includes(next)){
      if (routeEmit.hasOwnProperty(next))
        this.routeSubject.next(routeEmit[next]);
      return true;
    }

    /*Alt  (any not defined in pathAllowed are considered '*' )
    if (!pathAllowed.hasOwnProperty(next) 
    || (pathAllowed.hasOwnProperty(next) && (
      pathAllowed[next].includes(current)
      || ( pathAllowed[next].includes('**') )
      || ( pathAllowed[next].includes('*')  &&  allPaths.filter(path => !path.includes('/')).includes(current) )
    )))
      return true;
    */

    this.router.navigate(defaultRedirect);
    return false;
  }
  


  trim (path: string, replaceRepeats?: boolean): string {
    if (replaceRepeats)
      path = path.replace(/\\/g,"/").replace(/\/{2,}/g,"/").replace(/\*{3,}/g,"*");
    if (path.startsWith('/') || path.startsWith('\\'))
      path = path.substring(1);
    if (path.endsWith('/') || path.endsWith('\\'))
      path = path.substring(0, path.length-1);
    return path;
  }




  //source https://stackoverflow.com/a/45492930
  private listAllPaths(parent: String, config: Route[]) {
    for (let route of config) {
      allPaths.push(parent + '/' + route.path);
      if (route.children) {
        const currentPath = route.path ? parent + '/' + route.path : parent;
        this.listAllPaths(currentPath, route.children);
      }
    }
  }


  
  
  /** Alt2 
   * This converts the mapping from [next -> current]  to  [current -> next]
   * not to be used or practical, just for practice
   * 
   * any pathAllowed not defined is considered to be inaccessible 
   */
  private setPathTravel (){
    let travel: {[cur: string]: string[]} = {};
    for (let path of allPaths){  travel[path] = [];  }
    for (let next in pathAllowed){
      let paths = pathAllowed[next];
      if (Array.isArray(paths)){
        paths.map(path => this.trim(path));
        if (paths.length > 1 && paths.includes('**'))
          paths = ['**'];
        if (paths.length > 1 && paths.includes('*'))
          paths = ['*'];
        for (let path of paths){
          if (path === '**') //add to all paths
            allPaths.map(matched => travel[matched].push(next));
          else if (path === '*') //add to any path with a single segment
            allPaths.filter(path => !path.includes('/')).map(matched => travel[matched].push(next));
          else if (path.includes('*')){ //add to all that match the regex
            let pattern = "^"+path.replace("/**/", `\/[${validChars}/]+\/`)
            .replace("**/", `[${validChars}/]+\/`)
            .replace("/**", `\/?[${validChars}/]*`)
            .replace("/*/", `\/[${validChars}]+\/`)
            .replace("*/",`[${validChars}]+\/`)
            .replace("/*",`\/?[${validChars}]*`)+"$"; 
            let regex = new RegExp(pattern);
            let filtered = allPaths.filter(path => path.match(regex));
            filtered.map(matched => travel[matched].push(next));
          }
          else //add specific path
            travel[path].push(next);
        }
      }
    }
    for (let k of Object.keys(validPathTravel)){ delete validPathTravel[k]; }
    for (let k of Object.keys(travel)){ validPathTravel[k] = travel[k]; }
  }
  




}

