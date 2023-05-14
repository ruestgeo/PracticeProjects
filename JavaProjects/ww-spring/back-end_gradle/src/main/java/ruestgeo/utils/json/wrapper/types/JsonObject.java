package ruestgeo.utils.json.wrapper.types;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import ruestgeo.utils.json.wrapper.Json;



public interface JsonObject extends Iterable<Json> {    
    /*
     * operations such as findKey or contains is not supported
     */


    
    public Boolean isObject ();


    public Integer size ();

    

    /**
     * @return null if Json instance is not a JSON object
     */
    public Boolean has (String key);



    /** get JSON element from object via string key
     * @return null if JSON object has no key
     * 
     * @see JsonObject.has
     */
    public Json get (String key);


    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element.
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Json value);

    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, String value);

    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Boolean value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Byte value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Short value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Integer value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Long value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, BigInteger value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Float value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Double value);
    
    /** 
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, BigDecimal value);

    /**
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, List<Json> value);

    /**
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * 
     * @see JsonObject.has
     */
    public Json set (String key, Map<String,Json> value);

    

    /**
     * @return the removed Json element 
     * or null if either JSON was not object or key doesn't exist
     * 
     * @see JsonObject.has
     */
    public Json remove (String key);



    /**
     * Iterate over entries of map:  Entry<String,Json>
     */
    public Iterator<Json> iterator ();




    
//#region deprec

    /* DEPREC
     * @param value List<JsonElement> a List of valid JSON elements
     * @see Json.isValidJsonElement
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * @deprec
     */
    //public Json set (String key, List<?> value);

    /* DEPREC
     * @param value Map<String,JsonElement> a Map with String key 
     * and values that are valid JSON elements
     * @see Json.isValidJsonElement
     * @return null if not a JSON object or if key is new, 
     * otherwise return the replaced Json element
     * @deprec
     */
    //public Json set (String key, Map<?,?> value);

//#endregion deprec

}
