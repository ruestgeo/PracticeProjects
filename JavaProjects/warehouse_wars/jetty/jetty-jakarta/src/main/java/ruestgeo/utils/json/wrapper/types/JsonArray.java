package ruestgeo.utils.json.wrapper.types;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import ruestgeo.utils.json.wrapper.Json;



public interface JsonArray extends Iterable<Json> {
    /*
     * operations such as find or contains is not supported
     */

     

    public Boolean isArray ();


    public Integer size ();



    /** get JSON element from array via index
     * @return null if index is invalid
     */
    public Json get (Integer index);



    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Json value);

    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, String value);

    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Boolean value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Byte value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Short value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Integer value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Long value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, BigInteger value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Float value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Double value);
    
    /** 
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, BigDecimal value);

    /**
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, List<Json> value);

    /**
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     */
    public Json set (Integer index, Map<String,Json> value);


    
    /**
     * @return this Json instance
     */
    public Json add (Json value);

    /**
     * @return this Json instance
     */
    public Json add (String value);

    /**
     * @return this Json instance
     */
    public Json add (Boolean value);

    /**
     * @return this Json instance
     */
    public Json add (Byte value);

    /**
     * @return this Json instance
     */
    public Json add (Short value);

    /**
     * @return this Json instance
     */
    public Json add (Integer value);

    /**
     * @return this Json instance
     */
    public Json add (Long value);

    /**
     * @return this Json instance
     */
    public Json add (BigInteger value);

    /**
     * @return this Json instance
     */
    public Json add (Float value);

    /**
     * @return this Json instance
     */
    public Json add (Double value);

    /**
     * @return this Json instance
     */
    public Json add (BigDecimal value);

    /** 
     * @return this Json instance
     */
    public Json add (List<Json> value);

    /**
     * @return this Json instance
     */
    public Json add (Map<String,Json> value);



    /**
     * @return the removed Json element 
     * or null if either JSON was not array or index is invalid
     */
    public Json remove (Integer index);



    /**
     * Iterate over Json elements of List
     */
    public Iterator<Json> iterator ();





    
//#region deprec

    /* DEPREC
     * @param value List<JsonElement> a List of valid JSON elements
     * @see Json.isValidJsonElement
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     * @deprec
     */
    //public Json set (Integer index, List<?> value);

    /* DEPREC
     * @param value Map<String,JsonElement> a Map with String key 
     * and values that are valid JSON elements
     * @see Json.isValidJsonElement
     * @return null if not a JSON array or if index is invalid, 
     * otherwise return the replaced Json element
     * @deprec
     */
    //public Json set (Integer index, Map<?,?> value);

    /* DEPREC
     * @param value List<JsonElement> a List of valid JSON elements
     * @see Json.isValidJsonElement
     * @return this Json instance
     * @deprec
     */
    //public Json add (List<?> value);

    /* DEPREC
     * @param value Map<String,JsonElement> a Map with String key 
     * and values that are valid JSON elements
     * @see Json.isValidJsonElement
     * @return this Json instance
     * @deprec
     */
    //public Json add (Map<?,?> value);

//#endregion deprec
    

}
