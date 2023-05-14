package ruestgeo.utils.json.transform.types;

import ruestgeo.utils.json.transform.JsonElement;

import java.util.List;


public class JsonArray extends JsonElementBase<List<JsonElement>> {

    public JsonArray (List<JsonElement> val){
        this.value = val;
        //this.type = JsonType.ARRAY;
    }
    
}
