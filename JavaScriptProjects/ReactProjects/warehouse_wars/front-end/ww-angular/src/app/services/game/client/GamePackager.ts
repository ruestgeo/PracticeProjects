import { Injectable } from "@angular/core";
import { GamePackage, isGamePackage } from "src/app/types/ClientReceive";
import { isJsonElement, JsonElement } from "src/app/types/JsonElement";

@Injectable({
    providedIn: 'root'
})
export class GamePackager {
    
    createPackage (options: GamePackage): string {
        if (!isJsonElement(options) || options === null)
            throw {code: 4001, reason: 'cannot create package;  must provide a valid JSON element'}

        let raw_pack = JSON.stringify(options);
        console.log(`ww game pack package:  ${raw_pack}`);
        return raw_pack;
    }
    
    unpackPackage (raw_pack: JsonElement): GamePackage {
        console.log(`ww game unpack package:  ${raw_pack}`);

        if (!isJsonElement(raw_pack))
            throw new Error('received pack is not a valid JSON element or contains an invalid element');

        let pack;
        if (typeof raw_pack === "string"){
            try { pack = JSON.parse(raw_pack); }
            catch (error){ throw (error); }
        }

        if (isGamePackage(pack)) 
            return pack;
        else 
            throw {code: 4002, reason: 'received pack is not GamePackage'};
    }
}