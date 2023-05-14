package ruestgeo.utils.json.transform;

import ruestgeo.utils.json.transform.types.*;

import java.util.List;
import java.util.Map;




/**
 * An abstraction of JSON implementations via conversion to JsonElement object
 * @param element : void | Number | String | Boolean | Array<JsonElement> | Map<String, JsonElement>
 * if no param given, element is null
 */
public abstract class JsonElement {
    protected JsonType type;
    protected JsonElementBase<?> element;
    
        

    public abstract Boolean isNull ();
    public abstract Boolean isBoolean ();
    public abstract Boolean isNumber ();
    public abstract Boolean isString ();
    public abstract Boolean isArray ();
    public abstract Boolean isObject ();




    public abstract JsonType getType ();


    /**
     * 
     * @return
     * @throws IllegalStateException if type of JsonElement is not JsonType.BOOLEAN
     */
    public abstract Boolean getBool () throws IllegalStateException;


    /**
     * @return Number
     * @throws IllegalStateException if type of JsonElement is not JsonType.NUMBER
     */
    public abstract Number getNum () throws IllegalStateException;


    /**
     * @return String
     * @throws IllegalStateException if type of JsonElement is not JsonType.STRING
     */
    public abstract String getStr () throws IllegalStateException;


    /**
     * @return List<JsonElement>
     * @throws IllegalStateException if type of JsonElement is not JsonType.ARRAY
     */
    public abstract List<JsonElement> getArr () throws IllegalStateException;


    /**
     * @return Map<String,JsonElement>
     * @throws IllegalStateException if type of JsonElement is not JsonType.OBJECT
     */
    public abstract Map<String,JsonElement> getObject () throws IllegalStateException;



    public abstract JsonElement get (String key) throws IllegalStateException, IllegalArgumentException;

    public abstract Boolean has (String key) throws IllegalStateException;




    public abstract Boolean containsString (String string) throws IllegalStateException;



    public abstract String toString ();
}
