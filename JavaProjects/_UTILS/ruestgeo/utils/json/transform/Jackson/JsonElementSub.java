package ruestgeo.utils.json.transform.Jackson;

import ruestgeo.utils.json.transform.types.*;
import ruestgeo.utils.json.transform.JsonElement;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;



/**
 * An abstraction of JSON implementations via conversion to JsonElement object
 * -jackson
 * @param element : void | Number | String | Boolean | Array<JsonElement> | Map<String, JsonElement>
 * if no param given, element is null
 */
public class JsonElementSub extends JsonElement {
    private JsonType type;
    private JsonElementBase<?> element;
    
    static ObjectMapper objectMapper = new ObjectMapper();
    
    
    public JsonElementSub (){ 
        this.element = null; 
        this.type = JsonType.NULL;
    }


    public JsonElementSub (Number number){ 
        this.element = new JsonNumber(number);
        this.type = JsonType.NUMBER; 
    }


    public JsonElementSub (String string){ 
        this.element = new JsonString(string); 
        this.type = JsonType.STRING; 
    }


    public JsonElementSub (Boolean bool){ 
        this.element = new JsonBoolean(bool); 
        type = JsonType.BOOLEAN; 
    }


    public JsonElementSub (List<JsonElement> list){ 
        this.element = new JsonArray(list); 
        this.type = JsonType.ARRAY; 
    }


    public JsonElementSub (Map<String, JsonElement> map){ 
        this.element = new JsonObject(map); 
        this.type = JsonType.OBJECT; 
    }



    

    public Boolean isNull (){ return this.type == JsonType.NULL; }
    public Boolean isBoolean (){ return this.type == JsonType.BOOLEAN; }
    public Boolean isNumber (){ return this.type == JsonType.NUMBER; }
    public Boolean isString (){ return this.type == JsonType.STRING; }
    public Boolean isArray (){ return this.type == JsonType.ARRAY; }
    public Boolean isObject (){ return this.type == JsonType.OBJECT; }




    public JsonType getType (){ return type; }


    /**
     * 
     * @return
     * @throws IllegalStateException if type of JsonElement is not JsonType.BOOLEAN
     */
    public Boolean getBool () throws IllegalStateException { 
        if (type == JsonType.BOOLEAN)
            return ((JsonBoolean) this.element).get();
        else throw new IllegalStateException("JsonElement is not boolean");
    }


    /**
     * @return Number
     * @throws IllegalStateException if type of JsonElement is not JsonType.NUMBER
     */
    public Number getNum () throws IllegalStateException {  
        if (this.type == JsonType.NUMBER)
            return ((JsonNumber) this.element).get();
        else throw new IllegalStateException("JsonElement is not number");
    }


    /**
     * @return String
     * @throws IllegalStateException if type of JsonElement is not JsonType.STRING
     */
    public String getStr () throws IllegalStateException { 
        if (this.type == JsonType.STRING)
            return ((JsonString) this.element).get();
        else throw new IllegalStateException("JsonElement is not string");
    }


    /**
     * @return List<JsonElement>
     * @throws IllegalStateException if type of JsonElement is not JsonType.ARRAY
     */
    public List<JsonElement> getArr () throws IllegalStateException { 
        if (this.type == JsonType.ARRAY)
            return ((JsonArray) this.element).get();
        else throw new IllegalStateException("JsonElement is not array");
    }


    /**
     * @return Map<String,JsonElement>
     * @throws IllegalStateException if type of JsonElement is not JsonType.OBJECT
     */
    public Map<String,JsonElement> getObject () throws IllegalStateException {
        if (this.type == JsonType.OBJECT)
            return ((JsonObject) this.element).get();
        else throw new IllegalStateException("JsonElement is not object");
    }



    public JsonElement get (String key) throws IllegalStateException, IllegalArgumentException {
        if (this.type == JsonType.OBJECT){
            if (((JsonObject) this.element).get().containsKey(key))
                return ((JsonObject) this.element).get().get(key);
            else throw new IllegalArgumentException(key);
        }
        else throw new IllegalStateException("JsonElement is not object");
    }

    public Boolean has (String key) throws IllegalStateException {
        if (this.type == JsonType.OBJECT){
            return ((JsonObject) this.element).get().containsKey(key);
        }
        else throw new IllegalStateException("JsonElement is not object");
    }




    public Boolean containsString (String string) throws IllegalStateException {
        if (this.type == JsonType.OBJECT){
            Iterator<Entry<String,JsonElement>> iter = ((JsonObject) this.element).get().entrySet().iterator();
            while (iter.hasNext()){
                JsonElement element = iter.next().getValue();
                if (element.isString() && element.getStr().equals(string))
                    return true;
            }
            return false;
        }
        else if (this.type == JsonType.ARRAY){
            for (JsonElement element : ((JsonArray) this.element).get()){
                if (element.isString() && element.getStr().equals(string))
                    return true;
            }
            return false;
        }
        else {
            throw new IllegalStateException("JsonElement is not object or array");
        }
    }

    

    
    static JsonElement fromPath (String path) throws IOException {
        try{
            File configFile = new ClassPathResource(path).getFile();
            JsonNode jsonNode = objectMapper.readTree(configFile);
            return parseJackson(jsonNode);
        }
        catch (IOException err){ throw err; }
    }

    static JsonElement fromFile (File file) throws IOException {
        try{
            JsonNode jsonNode = objectMapper.readTree(file);
            return parseJackson(jsonNode);
        }
        catch (IOException err){ throw err; }
    }
    

    private static JsonElement parseJackson (JsonNode json){
        if (json.isObject()){
            Map<String, JsonElement> map = new HashMap<String, JsonElement>();
            Iterator<Entry<String, JsonNode>> iter = json.fields();
            while (iter.hasNext()){
                Map.Entry<String, JsonNode> entry = iter.next();
                map.put(entry.getKey(), parseJackson(entry.getValue()));
            }
            return new JsonElementSub(map);
        }
        else if (json.isArray()){
            List<JsonElement> list = new ArrayList<JsonElement>();
            Iterator<JsonNode> iter = json.elements();
            while (iter.hasNext()){
                list.add(parseJackson(iter.next()));
            }
            return new JsonElementSub(list);
        }
        else if (json.isBoolean()){
            return new JsonElementSub(json.asBoolean());
        }
        else if (json.isNumber()){
            if (json.isInt())
                return new JsonElementSub(json.asInt());
            else if (json.isDouble())
                return new JsonElementSub(json.asDouble());
            else //if(json.isLong())
                return new JsonElementSub(json.asLong());
        }
        else if (json.isTextual())
            return new JsonElementSub(json.asText());
        else
            return new JsonElementSub();
    }




    public String toString () {
        if (this.type == JsonType.STRING){
            return "\""+this.element.get().toString()+"\"";
        }
        else if (this.type == JsonType.OBJECT){
            String string = "{";
            Iterator<Entry<String,JsonElement>> iter = ((JsonObject) this.element).get().entrySet().iterator();
            while (iter.hasNext()){
                Entry<String,JsonElement> entry = iter.next();
                string += "\""+entry.getKey()+"\": "+entry.getValue().toString();
                if (iter.hasNext())
                    string += ", ";
            }
            return string+"}";
        }
        else if (this.type == JsonType.ARRAY){
            String string = "[";
            Iterator<JsonElement> iter = ((JsonArray) this.element).get().iterator();
            while (iter.hasNext()){
                JsonElement element = iter.next();
                string += element.toString();
                if (iter.hasNext())
                    string += ", ";
            }
            return string+"]";
        }
        else {
            return this.element.get().toString();
        }
    }
}
