import { JsonObject } from "../JsonElement";

export interface ChatPackage extends JsonObject {
    content: string;
    [opt: string]: any;
}

export function isChatPackage (object: any): object is ChatPackage {
    return object && typeof object.content === 'string';
}