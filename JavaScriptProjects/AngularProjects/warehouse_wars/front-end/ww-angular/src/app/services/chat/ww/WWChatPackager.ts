import { Injectable } from "@angular/core";
import { ChatPackagerInterface } from "src/app/services/chat/common/ChatPackagerInterface";
import { ChatPackage } from "src/app/services/chat/common/ChatPackage";
import { isWWUser, WWUser } from "src/app/types/WWUser";
import { isWWChatPackage, WWChatPackage } from "src/app/services/chat/ww/WWChatPackage";
import { isJsonElement, JsonElement } from "src/app/types/JsonElement";

@Injectable({
    providedIn: 'root'
})
export class WWChatPackager implements ChatPackagerInterface {
    
    createPackage (options: ChatPackage): string {
        if (!isJsonElement(options) || options === null)
            throw {code: 4001, reason: 'cannot create package;  must provide a valid JSON element'}

        let raw_pack = JSON.stringify(options);
        //console.log(`ww chat pack package:  ${raw_pack}`);
        return raw_pack;
    }
    
    unpackPackage (raw_pack: JsonElement): ChatPackage {
        //console.log(`ww chat unpack package:  ${raw_pack}`);

        if (!isJsonElement(raw_pack))
            throw new Error('received pack is not a valid JSON element or contains an invalid element');

        let pack;
        if (typeof raw_pack === "string"){
            try { pack = JSON.parse(raw_pack); }
            catch (error){ throw (error); }
        }

        if (isWWChatPackage(pack)) 
            return pack;
        else 
            throw {code: 4002, reason: 'received pack is not WWChatPackage'};
    }
}