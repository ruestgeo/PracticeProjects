export interface GamePackage {
  type: string;
  token?: string; //used to ensure a response is directed to a request (not fully supported)
  [k: string]: any;
}
export function isGamePackage (object: any): object is GamePackage {
  return typeof object === 'object' && typeof object.type === 'string';
}