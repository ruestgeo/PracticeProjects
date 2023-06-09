package ruestgeo.utils.json.wrapper;

//import ruestgeo.utils.json.wrapper.Jackson.JsonImpl; //change this as needed
import ruestgeo.utils.json.wrapper.Gson.JsonImpl; //change this as needed

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;


/*
 * DEV:  must manually change package to swap to wrapper
 * 
 * wrapper class must implement the following constructors & static methods:
 * 
 *  Json ()  ->  creates empty JSON object
 *  public Json (String val)  ->  literal string
 *  public Json (Boolean val)
 *  public Json ( ?Number val)  -> all of Byte, Short, Integer, Long, BigInteger, Float, Double, BigDecimal
 *  public Json (List<Json> val)
 *  public Json (Map<String,Json> val)
 * 
 *  public static Json parse (String json) throws IllegalArgumentException 
 *  public static Json parse (File file) throws IOException
 */





/**
 * A factory to create Json instance
 */
public class JsonFactory {

    /**
     * Parse a json string to create a Json instance
     * @param json A json string
     * @return Json instance
     * @throws IllegalArgumentException if an error was encountered when parsing the json string
     */
    public static Json parse (String json) throws IllegalArgumentException {
        return JsonImpl.parse(json);
    }



    /** Create a Json instance of an empty JSON object */
    public static Json create (){
        return new JsonImpl();
    }



    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (String value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Boolean value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Byte value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Short value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Integer value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Long value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (BigInteger value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Float value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Double value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (BigDecimal value){
        return new JsonImpl(value);
    }


    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (List<Json> value){
        return new JsonImpl(value);
    }

    
    /** Create a Json instance.
     * @return Json instance
     */
    public static Json create (Map<String,Json> value){
        return new JsonImpl(value);
    }



    /** Create a Json object instance.
     * @return Json instance
     */
    public static Json createObject (){
        return new JsonImpl((Map<String,Json>) null);
    }

    
    /** Create a Json object instance.
     * @return Json instance
     */
    public static Json createArray (){
        return new JsonImpl((List<Json>) null);
    }

    
    
    /** Create a Json instance.
     * @return Json instance or null if failed read a valid JSON from file
     */
    public static Json read (File file){
        try {
            return JsonImpl.parse(file);
        } 
        catch (IOException e) {
            System.err.println(e);
            e.printStackTrace();
            return null;
        }
    }




}
