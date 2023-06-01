export type JsonElement = null | string | number | boolean | JsonObject | JsonArray;

export interface JsonObject { 
    [key: string]: JsonElement | undefined; //undefined is added for optional params; undefined is not valid JSON
};

export interface JsonArray extends Array<JsonElement> {};



export function isJsonElement (x: any): x is JsonElement {
    return x === null || (typeof x === 'string' || typeof x === 'number'
    || typeof x === 'boolean' || isJsonArray(x) || isJsonObject(x));
}

export function isJsonObject (x: any): x is JsonObject {
    return typeof x === 'object' 
    && Object.keys(x).reduce((acc:boolean, next: any) => acc && typeof next === 'string', true)
    && Object.values(x).reduce((acc:boolean, next: any) => acc && isJsonElement(next), true);
}

export function isJsonArray (x: any): x is JsonArray {
    return Array.isArray(x) 
    && x.reduce((acc:boolean, next: any) => acc && isJsonElement(next), true);
}


