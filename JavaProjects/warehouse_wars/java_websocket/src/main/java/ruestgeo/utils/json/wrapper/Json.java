package ruestgeo.utils.json.wrapper;

import ruestgeo.utils.json.wrapper.types.*;

import java.util.Iterator;
import java.util.List;
import java.util.Map;




/** 
 * Abstraction of a JSON encoder/decoder via wrapper
 */
public interface Json extends JsonNull, JsonString, JsonBoolean, JsonNumber, JsonArray, JsonObject {

    /**
     * DEV:  
     *  must implement the following constructors:
     * 
     *  Json ()  ->  creates empty JSON object
     *  public Json (String val)  ->  literal string
     *  public Json (Boolean val)
     *  public Json ( ?Number val)  ->  all of Byte, Short, Integer, Long, BigInteger, Float, Double, BigDecimal
     *  public Json (List<Json> val)
     *  public Json (Map<String,Json> val)
     * 
     *  public static Json parse (String json) throws IllegalArgumentException 
     *  public static Json parse (File file) throws IOException
     */



    /** 
     * Check if Object element is either String, Number, Boolean
     * @warning Primitive types must not be used
     * @deprecated supported types are explicityly:
     *  Json, String, Boolean, Number, List< Json >, and Map< String, Json >
     */
    @Deprecated
    public static Boolean isValidJsonElement (Object element){
        if (element instanceof String || element instanceof Boolean 
        || element instanceof Number || element instanceof Json){
            return true;
        }
        else if ( element instanceof List<?>){
            //return ((List<?>) element).stream().allMatch(Json::isValidJsonElement); //deprec
            return ((List<?>) element).stream().allMatch(Json.class::isInstance);
        }
        else if ( element instanceof Map<?,?>){
            if (((Map<?,?>) element).keySet().stream().allMatch(String.class::isInstance)){
                //return ((Map<?,?>) element).values().stream().allMatch(Json::isValidJsonElement); //deprec
                return ((Map<?,?>) element).values().stream().allMatch(Json.class::isInstance);
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }


    public String toString ();

    
    /** 
     ** If JSON object:
     *      Iterate over entries of map
     * 
     * --///--
     * 
     ** If JSON array:
     *      Iterate over elements of list
     * 
     * --///--
     * 
     ** else:
     *      iterator with no next  (0 item iterator)
     * 
     * @see https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Iterator.html
     */
    public Iterator<Json> iterator ();

}
