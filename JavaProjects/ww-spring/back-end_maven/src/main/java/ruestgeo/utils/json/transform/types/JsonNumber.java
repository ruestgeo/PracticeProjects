package ruestgeo.utils.json.transform.types;


public class JsonNumber extends JsonElementBase<Number> {

    public JsonNumber (Number val){
        this.value = val;
        //this.type = JsonType.NUMBER;
    }
    
}
