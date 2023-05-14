package ruestgeo.utils.json.transform.types;

import ruestgeo.utils.json.transform.JsonElement;

import java.util.Map;


public class JsonObject extends JsonElementBase<Map<String,JsonElement>> {

    public JsonObject (Map<String,JsonElement> val){
        this.value = val;
        //this.type = JsonType.OBJECT;
    }
    
}
