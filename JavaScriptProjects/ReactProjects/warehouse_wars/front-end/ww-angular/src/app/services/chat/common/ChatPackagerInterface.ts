
import { ChatPackage } from "src/app/services/chat/common/ChatPackage";
import { JsonElement } from "src/app/types/JsonElement";

export abstract class ChatPackagerInterface {
    abstract createPackage (options: ChatPackage): string | ArrayBuffer | Blob | ArrayBufferView;
    abstract unpackPackage (pack: JsonElement): ChatPackage;
}

/*export interface ChatPackagerInterface {
    createPackage (options: ChatPackage): string | ArrayBuffer | Blob | ArrayBufferView;
    unpackPackage (pack: JsonElement): ChatPackage;
}*/
