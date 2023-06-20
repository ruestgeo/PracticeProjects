
const validPathTravel: {[currentPath: string]: /*nextPath*/ string[]} = {
  '': ['login'],
  'login': ['', 'lobby'],
  'lobby': ['', 'game', 'login'],
  'game': ['', 'lobby', 'login']
}



function trim (path: string, replaceRepeats?: boolean): string {
  if (replaceRepeats)
    path = path.replace(/\\/g,"/").replace(/\/{2,}/g,"/").replace(/\*{3,}/g,"*");
  if (path.startsWith('/') || path.startsWith('\\'))
    path = path.substring(1);
  if (path.endsWith('/') || path.endsWith('\\'))
    path = path.substring(0, path.length-1);
  return path;
}



export function canNavigateTo( currentPath: string, requestedRoute: string): boolean {
  currentPath = trim(currentPath, true);
  requestedRoute = trim(requestedRoute, true);
  console.log(`navigate current :   [${currentPath}]    next :   [${requestedRoute}]`);
  if (currentPath === requestedRoute) {
    return true;
  }
  else if (validPathTravel.hasOwnProperty(currentPath) && validPathTravel[currentPath].includes(requestedRoute)){
    return true;
  }
  return false;
}
