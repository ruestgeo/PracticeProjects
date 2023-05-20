package ruestgeo.utils.json.wrapper.Jackson;

import ruestgeo.utils.json.wrapper.Json;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Map.Entry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;




/** 
 * Abstraction of a JSON encoder/decoder via wrapper
 * - jackson
 */
public class JsonImpl implements Json {
    private JsonNode node;

    static final ObjectMapper objectMapper = new ObjectMapper();


    public static Json parse (String json) throws IllegalArgumentException {
        try {
            return new JsonImpl(objectMapper.readTree(json));
        } 
        catch (JsonProcessingException e) {
            throw new IllegalArgumentException(e.toString());
        }
    }


    public static Json parse (File file) throws IOException {
        return new JsonImpl(objectMapper.readTree(file));
    }




//#region constructor

    private JsonImpl (JsonNode val) {
        this.node = val;
    }


    /** Create  */
    public JsonImpl () {
        this.node = objectMapper.createObjectNode();
    }

    public JsonImpl (String val) {
        this.node = JsonNodeFactory.instance.textNode(val);
    }


    public JsonImpl (Boolean val) {
        if (val){
            this.node = BooleanNode.getTrue();
        }
        else {
            this.node = BooleanNode.getFalse();
        }
    }


    public JsonImpl (Byte val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((Byte) val);
    }
    public JsonImpl (Short val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((Short) val);
    }
    public JsonImpl (Integer val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((Integer) val);
    }
    public JsonImpl (Long val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((Long) val);
    }
    public JsonImpl (BigInteger val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((BigInteger) val);
    }
    public JsonImpl (Float val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((Float) val);
    }
    public JsonImpl (Double val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((Double) val);
    }
    public JsonImpl (BigDecimal val) {
        if (val == null)
            this.node = JsonNodeFactory.instance.nullNode();
        else
            this.node = JsonNodeFactory.instance.numberNode((BigDecimal) val);
    }


    public JsonImpl (List<Json> val) {
        ArrayNode node = objectMapper.createArrayNode();
        if (val != null){
            for (Json json : val){
                node.add(((JsonImpl) json).getNode());
            }
        }
        
        this.node = node;
    }


    public JsonImpl (Map<String,Json> val) {
        ObjectNode node = objectMapper.createObjectNode();
        if (val != null){
            for (Entry<String,Json> entry : val.entrySet()){
                node.set(
                    entry.getKey(), 
                    ((JsonImpl) entry.getValue()).getNode() 
                );
            }
        }
        
        this.node = node;
    }


    public JsonImpl (File file) throws IOException {
        try {
            this.node = objectMapper.readTree(file);
        } 
        catch (IOException e) {
            throw e;
        }
    }

//#endregion constructor




//#region public-methods

//#region get

    public Json get (String key) {
        if (this.node.isObject()){
            if (this.node.has(key)){
                return new JsonImpl(this.node.get(key));
            }
            else {
                //throw new IllegalArgumentException("JSON object does not contain key \""+key+"\"");
                return null;
            }
        }
        else {
            //throw new IllegalAccessException("JSON element is not an object");
            return null;
        }
    }



    public Json get (Integer index) {
        if (this.node.isArray()){
            if (this.node.size() > index && index >= 0){
                return new JsonImpl(this.node.get(index));
            }
            else {
                //throw new IllegalArgumentException("JSON array cannot index to ["+index+"]; Out-of-bounds");
                return null;
            }
        }
        else {
            //throw new IllegalAccessException("JSON element is not an array");
            return null;
        }
    }



    public String getString () {
        return this.getString(null);
    }

    public String getString (String _default) {
        if (this.node.isTextual()){
            return this.node.asText();
        }
        else {
            return _default;
        }
    }



    public Boolean getBoolean () {
        return this.getBoolean(null);
    }

    public Boolean getBoolean (Boolean _default) {
        if (this.node.isBoolean()){
            return this.node.asBoolean();
        }
        else {
            return _default;
        }
    }



    public Byte getByte () throws ArithmeticException {
        return this.getByte(null);
    }

    public Byte getByte (Byte _default) throws ArithmeticException {
        if (this.node.isNumber()){
            if ( (this.node.isFloat() || this.node.isDouble()) && this.node.asDouble() % 1 == 0 
            && this.node.asDouble() <= Byte.MAX_VALUE && this.node.asDouble() >= Byte.MIN_VALUE ){
                return (byte) this.node.asInt();
            }
            else if ( (this.node.isLong() || this.node.isInt()) 
            && this.node.asLong() <= Byte.MAX_VALUE && this.node.asLong() >= Byte.MIN_VALUE ){
                return (byte) this.node.asInt();
            }
            throw new ArithmeticException("Cannot cast number to byte;  lossy conversion");
        }
        else {
            return _default;
        }
    }



    public Short getShort () throws ArithmeticException {
        return this.getShort(null);
    }

    public Short getShort (Short _default) throws ArithmeticException {
        if (this.node.isNumber()){
            if ( this.node.isShort() ){
                return (short) this.node.asInt();
            }
            else if ( (this.node.isFloat() || this.node.isDouble()) && this.node.asDouble() % 1 == 0 
            && this.node.asDouble() <= Short.MAX_VALUE && this.node.asDouble() >= Short.MIN_VALUE ){
                return (short) this.node.asInt();
            }
            else if ( (this.node.isLong() || this.node.isInt()) 
            && this.node.asLong() <= Short.MAX_VALUE && this.node.asLong() >= Short.MIN_VALUE ){
                return (short) this.node.asInt();
            }
            throw new ArithmeticException("Cannot cast number to short;  lossy conversion");
        }
        else {
            return _default;
        }
    }



    public Integer getInteger () throws ArithmeticException {
        return this.getInteger(null); 
    }

    public Integer getInteger (Integer _default) throws ArithmeticException {
        if (this.node.isNumber()){
            if ( this.node.isInt() ){
                return this.node.asInt();
            }
            else if ( (this.node.isFloat() || this.node.isDouble()) && this.node.asDouble() % 1 == 0 
            && this.node.asDouble() <= Integer.MAX_VALUE && this.node.asDouble() >= Integer.MIN_VALUE ){
                return this.node.asInt();
            }
            else if ( this.node.isLong() && this.node.asLong() <= Integer.MAX_VALUE 
            && this.node.asLong() >= Integer.MIN_VALUE ){
                return this.node.asInt();
            }
            throw new ArithmeticException("Cannot cast number to integer;  lossy conversion");
        }
        else {
            return _default;
        }
    }



    public Long getLong () throws ArithmeticException {
        return this.getLong(null);
    }

    public Long getLong (Long _default) throws ArithmeticException {
        if ( this.node.isNumber() ){
            if (this.node.isLong() || this.node.isInt() ){
                return this.node.asLong();
            }
            else if ( (this.node.isFloat() || this.node.isDouble()) && this.node.asDouble() % 1 == 0 ){
                return this.node.asLong();
            }
            throw new ArithmeticException("Cannot cast number to long;  lossy conversion");
        }
        else {
            return _default;
        }
    }



    public BigInteger getBigInteger () {
        return getBigInteger(null);
    }

    public BigInteger getBigInteger (BigInteger _default) {
        if ( this.node.isNumber() ){
            return this.node.bigIntegerValue();
        }
        else {
            return _default;
        }
    }



    public Float getFloat () throws ArithmeticException {
        return this.getFloat(null);
    }

    public Float getFloat (Float _default) throws ArithmeticException {
        if ( this.node.isNumber() ){
            if (this.node.isFloat() || this.node.isInt() ){
                return (float) this.node.asDouble();
            }
            else if ( this.node.isDouble() && this.node.asDouble() <= Float.MAX_VALUE 
            && this.node.asDouble() >= Float.MIN_VALUE ){
                return (float) this.node.asDouble();
            }
            throw new ArithmeticException("Cannot cast number to float;  lossy conversion");
        }
        else {
            return _default;
        }
    }



    public Double getDouble () throws ArithmeticException {
        return getDouble(null);
    }

    public Double getDouble (Double _default) throws ArithmeticException {
        if ( this.node.isNumber() ){
            if (this.node.isDouble() || this.node.isFloat() || this.node.isInt() ){
                return this.node.asDouble();
            }
            throw new ArithmeticException("Cannot cast number to double;  lossy conversion");
        }
        else {
            return _default;
        }
    }



    public BigDecimal getBigDecimal () {
        return this.getBigDecimal(null);
    }

    public BigDecimal getBigDecimal (BigDecimal _default) {
        if ( this.node.isNumber() ){
            return this.node.decimalValue();
        }
        else {
            return _default;
        }
    }



    public Byte getAsByte () {
        return (byte) this.node.asInt();
    }


    public Short getAsShort () {
        return (short) this.node.asInt();
    }
    

    public Integer getAsInteger () {
        return this.node.asInt();
    }
    

    public Long getAsLong () {
        return this.node.asLong();
    }
    

    public Float getAsFloat () {
        return (float) this.node.asDouble();
    }


    public Double getAsDouble () {
        return this.node.asDouble();
    }


//#endregion get



//#region set

//#region set-object

    public Json set (String key, Json value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, ((JsonImpl) value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, String value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Boolean value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Byte value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Short value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Integer value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Long value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, BigInteger value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Float value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Double value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, BigDecimal value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, List<Json> value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (String key, Map<String,Json> value) {
        if (this.node.isObject()){
            JsonNode replaced = null;
            replaced = ((ObjectNode) this.node).replace(key, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }

//#endregion set-object



//#region set-array

    public Json set (Integer index, Json value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, ((JsonImpl) value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, String value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Boolean value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Byte value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Short value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Integer value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Long value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, BigInteger value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Float value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Double value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, BigDecimal value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, List<Json> value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Map<String,Json> value) {
        if (this.node.isArray()){
            JsonNode replaced = null;
            replaced = ((ArrayNode) this.node).set(index, new JsonImpl(value).getNode());
            if (replaced == null)  return null;
            return new JsonImpl(replaced);
        }
        else  return null;
    }

//#endregion set-array



//#region add-array

    public Json add (Json value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(((JsonImpl) value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (String value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Boolean value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Byte value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Short value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Integer value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Long value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (BigInteger value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Float value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Double value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (BigDecimal value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (List<Json> value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }


    public Json add (Map<String,Json> value) {
        if (this.node.isArray()){
            ((ArrayNode) this.node).add(new JsonImpl(value).getNode());
            return this;
        }
        else  return null;
    }

//#endregion add-array

//#endregion set



//#region remove

    public Json remove (String key) {
        if (this.node.isObject()){
            if (((ObjectNode) this.node).has(key)){
                JsonNode removed = ((ObjectNode) this.node).remove(key);
                //if (removed == null)  return null;
                return new JsonImpl(removed);
            }
            else {
                //throw new IllegalArgumentException("JSON object does not contain \""+key+"\"");
                return null;
            }
        }
        else {
            //throw new IllegalAccessException("JSON element is not an object");
            return null;
        }
    }


    public Json remove (Integer index) {
        if (this.node.isArray()){
            if (index >= 0 && ((ArrayNode) this.node).size() > index ){
                JsonNode removed = ((ArrayNode) this.node).remove(index);
                //if (removed == null)  return null;
                return new JsonImpl(removed);
            }
            else {
                //throw new IllegalArgumentException("JSON array cannot be indexed with ["+index+"]; out-of-bounds");
                return null;
            }
        }
        else {
            //throw new IllegalAccessException("JSON element is not an array");
            return null;
        }
    }

//#endregion remove



//#region has

public Boolean has (String key) {
    if (this.node.isObject()){
        return ((ObjectNode) this.node).has(key);
    }
    else {
        return null;
        //throw new IllegalAccessException("JSON element is not an object");
    }
}

//#endregion has



//#region is
    public Boolean isNull () {
        return this.node.isNull();
    }
    public Boolean isString () {
        return this.node.isTextual();
    }
    public Boolean isBoolean () {
        return this.node.isBoolean();
    }
    public Boolean isNumber () {
        return this.node.isNumber();
    }
    public Boolean isByte () {
        if (this.node.isNumber() && this.node.isShort() 
        && this.node.asInt() >= Byte.MIN_VALUE 
        && this.node.asInt() <= Byte.MAX_VALUE){
            return true;
        }
        return false;
    }
    public Boolean isShort () {
        return this.node.isShort();
    }
    public Boolean isInteger () {
        return this.node.isInt();
    }
    public Boolean isLong () {
        return this.node.isLong();
    }
    public Boolean isBigInteger () {
        return this.node.isBigInteger();
    }
    public Boolean isFloat () {
        return this.node.isFloat();
    }
    public Boolean isDouble () {
        return this.node.isDouble();
    }
    public Boolean isBigDecimal () {
        return this.node.isBigDecimal();
    }
    public Boolean isArray () {
        return this.node.isArray();
    }
    public Boolean isObject () {
        return this.node.isObject();
    }
//#endregion is



//#region iterator

@Override
public Iterator<Json> iterator() {
    Iterator<Json> iter;

    if (this.node.isObject()){
        iter = new Iterator<Json>() {
            private Entry<String, JsonNode> entry = null;
            private Iterator<Entry<String, JsonNode>> iterator = ((ObjectNode) node).fields();
            private boolean removed = false;
    
            @Override
            public boolean hasNext() {
                return iterator.hasNext();
            }
    
            @Override
            public Json next() {
                this.entry = iterator.next();
                if (this.entry.getValue() == null){
                    throw new NoSuchElementException("iteration has no more elements");
                }
                else  {
                    this.removed = false;
                    return new JsonImpl(this.entry.getValue());
                }
            }
    
            @Override
            public void remove() {
                if (entry == null){
                    throw new IllegalStateException("the next method has not yet been called");
                }
                else if (this.removed){
                    throw new IllegalStateException("remove method has already been called after the last call to the next method");
                }
                else {
                    ((ObjectNode) node).remove(this.entry.getKey());
                    this.removed = true;
                }
            }
        };
    }
    else if (this.node.isArray()){
        iter = new Iterator<Json>() {
            private int index = 0;
            private int size = ((ArrayNode) node).size();
            private boolean removed = false;
    
            @Override
            public boolean hasNext() {
                return ( (index < size)  &&  (((ArrayNode) node).get(index) != null) );
            }
    
            @Override
            public Json next() {
                if (index >= size){
                    throw new NoSuchElementException("iteration has no more elements");
                }
                else {
                    this.removed = false;
                    return new JsonImpl(((ArrayNode) node).get(index++));
                }
            }
    
            @Override
            public void remove() {
                if (index == 0){
                    throw new IllegalStateException("the next method has not yet been called");
                }
                //else if (index > size) throw new IllegalStateException("illegal index");
                else if (this.removed){
                    throw new IllegalStateException("remove method has already been called after the last call to the next method");
                }
                else  {
                    ((ArrayNode) node).remove(index-1);
                    this.removed = true;
                }
            }
        };
    }
    else {
        iter = new Iterator<Json>() {
            @Override
            public boolean hasNext() {
                return false;
            }
    
            @Override
            public Json next() {
                throw new NoSuchElementException("iteration has no more elements");
            }
    
            @Override
            public void remove() {
                throw new IllegalStateException("the next method has not yet been called");
            }
        };
    }

    return iter;
}

//#endregion iterator




    /**
     * @return -1 if not an JSON array or object, otherwise return number of elements
     */
    public Integer size () {
        if (this.node.isArray()){
            return ((ArrayNode) this.node).size();
        }
        else if (this.node.isObject()){
            return ((ObjectNode) this.node).size();
        }
        else return -1;
    }


    /**
     * @return null if an exception is caught
     */
    public String toString () {
        try {
            return objectMapper.writeValueAsString(this.node);
        } catch (JsonProcessingException e) {
            //throw new IllegalStateException(e.toString());
            return null;
        }
    }

//#endregion public-methods



//#region private-methods

    private JsonNode getNode (){
        return this.node;
    }

//#endregion private-methods





//#region deprec

    /* @deprecated */
    /*public JsonImpl (List<?> val) throws IllegalArgumentException {
        if (val == null){
            throw new IllegalArgumentException("Arg cannot be null");
        }
        try {
            if (val.stream().allMatch(Json.class::isInstance)){
                this.node = objectMapper.readTree(objectMapper.writeValueAsString(
                    ((List<JsonImpl>) val).stream().map(json -> json.getNode())
                ));
            }
            else if (Json.isValidJsonElement(val)){
                this.node = objectMapper.readTree(objectMapper.writeValueAsString(val));
            }
            else if (val.stream().allMatch(JsonNode.class::isInstance)){
                this.node = objectMapper.readTree(objectMapper.writeValueAsString(val));
            }
            else {
                throw new IllegalArgumentException("Arg is not a List that can be converted to JSON");
            }        
        } 
        catch (JsonProcessingException e) {
            throw new IllegalArgumentException(e.toString());
        }
        catch (IllegalArgumentException e){
            throw e;
        }
    }*/



    /* @deprecated */
    /*public JsonImpl (Map<?,?> val) throws IllegalArgumentException {
        if (val == null){
            throw new IllegalArgumentException("Arg cannot be null");
        }
        try {
            if (val.keySet().stream().allMatch(String.class::isInstance)){
                if (val.values().stream().allMatch(JsonNode.class::isInstance)){
                    this.node = objectMapper.readTree(objectMapper.writeValueAsString(val));
                }
                else if (val.values().stream().allMatch(Json.class::isInstance)){
                    this.node = objectMapper.readTree(objectMapper.writeValueAsString(
                        ((Map<String,JsonImpl>) val).entrySet().stream()
                        .collect(Collectors.toMap(Entry::getKey, entry -> entry.getValue().getNode() ))
                    ));
                }
            }
            else if (Json.isValidJsonElement(val)){
                this.node = objectMapper.readTree(objectMapper.writeValueAsString(val));
            }
            else {
                throw new IllegalArgumentException("Arg is not a Map that can be converted to JSON");
            }
        } 
        catch (JsonProcessingException e) {
            throw new IllegalArgumentException(e.toString());
        }
        catch (IllegalArgumentException e){
            throw e;
        }
    }*/



    /* @deprecated
     * @param key
     * @param value a valid JSON element
     * @throws IllegalAccessException if JSON element is not an object
     * @throws IllegalArgumentException if value arg is not a valid JSON element,
     * or if an error occured when processing the value
     * @return Json of the replaced item, if any, otherwise null
     */
    /*public Json set (String key, Object value) throws IllegalAccessException, IllegalArgumentException {
        if (this.node.isObject()){
            JsonNode replaced = null;
            if (Json.isValidJsonElement(value)){
                try {
                    if (value instanceof Json){
                        replaced = ((ObjectNode) this.node).replace(key, ((JsonImpl) value).getNode());
                    }
                    else if (value instanceof JsonNode){
                        replaced = ((ObjectNode) this.node).replace(key, ((JsonNode) value));
                    }
                    else if (value instanceof String){
                        replaced = ((ObjectNode) this.node).replace(key, new JsonImpl((String) value).getNode());
                    }
                    else if (value instanceof Boolean){
                        replaced = ((ObjectNode) this.node).replace(key, new JsonImpl((Boolean) value).getNode());
                    }
                    else if (value instanceof Number){
                        replaced = ((ObjectNode) this.node).replace(key, new JsonImpl((Number) value).getNode());
                    }
                    else if (value instanceof List){
                        replaced = ((ObjectNode) this.node).replace(key, new JsonImpl((List<?>) value).getNode());
                    }
                    else if (value instanceof Map){
                        replaced = ((ObjectNode) this.node).replace(key, new JsonImpl((Map<?,?>) value).getNode());
                    }
                }
                catch (IllegalArgumentException e) {
                    throw e;
                }
            }
            else if (value instanceof JsonImpl){
                replaced = ((ObjectNode) this.node).replace(key, ((JsonImpl) value).getNode());
            }
            else {
                throw new IllegalArgumentException("Second arg is not valid JSON element");
            }
            if (replaced == null)
                return null;
            return new JsonImpl(replaced);
        }
        else {
            throw new IllegalAccessException("JSON element is not an object");
        }
    }
    */



    /* @deprecated
     * @param index
     * @param value a valid JSON element
     * @throws IllegalAccessException if JSON element is not an array
     * @throws IllegalArgumentException if value arg is not a valid JSON element,
     * or if an error occured when processing the value
     * @return Json of the replaced item, if any, otherwise null
     */
    /*public Json set (Integer index, Object value) throws IllegalAccessException, IllegalArgumentException {
        if (this.node.isArray()){
            JsonNode replaced = null;
            if (Json.isValidJsonElement(value)){
                try {
                    if (value instanceof Json){
                        replaced = ((ArrayNode) this.node).set(index, ((JsonImpl) value).getNode());
                    }
                    else if (value instanceof JsonNode){
                        replaced = ((ArrayNode) this.node).set(index, ((JsonNode) value));
                    }
                    else if (value instanceof String){
                        replaced = ((ArrayNode) this.node).set(index, new JsonImpl((String) value).getNode());
                    }
                    else if (value instanceof Boolean){
                        replaced = ((ArrayNode) this.node).set(index, new JsonImpl((Boolean) value).getNode());
                    }
                    else if (value instanceof Number){
                        replaced = ((ArrayNode) this.node).set(index, new JsonImpl((Number) value).getNode());
                    }
                    else if (value instanceof List){
                        replaced = ((ArrayNode) this.node).set(index, new JsonImpl((List<?>) value).getNode());
                    }
                    else if (value instanceof Map){
                        replaced = ((ArrayNode) this.node).set(index, new JsonImpl((Map<?,?>) value).getNode());
                    }
                }
                catch (IllegalArgumentException e) {
                    throw e;
                }
            }
            else if (value instanceof JsonImpl){
                replaced = ((ArrayNode) this.node).set(index, ((JsonImpl) value).getNode());
            }
            else {
                throw new IllegalArgumentException("Second arg is not valid JSON element");
            }
            if (replaced == null)
                return null;
            return new JsonImpl(replaced);
        }
        else {
            throw new IllegalAccessException("JSON element is not an array");
        }
    }*/



    /* @deprecated
     * @param value a valid JSON element
     * @throws IllegalAccessException if JSON element is not an array
     * @throws IllegalArgumentException if value arg is not a valid JSON element,
     * or if an error occured when processing the value
     * @return this Json
     */
    /*public Json add (Object value) throws IllegalAccessException, IllegalArgumentException {
        if (this.node.isArray()){
            if (Json.isValidJsonElement(value)){
                try {
                    if (value instanceof Json){
                        ((ArrayNode) this.node).add(((JsonImpl) value).getNode());
                    }
                    else if (value instanceof JsonNode){
                        ((ArrayNode) this.node).add(((JsonNode) value));
                    }
                    else if (value instanceof String){
                        ((ArrayNode) this.node).add(new JsonImpl((String) value).getNode());
                    }
                    else if (value instanceof Boolean){
                        ((ArrayNode) this.node).add(new JsonImpl((Boolean) value).getNode());
                    }
                    else if (value instanceof Number){
                        ((ArrayNode) this.node).add(new JsonImpl((Number) value).getNode());
                    }
                    else if (value instanceof List){
                        ((ArrayNode) this.node).add(new JsonImpl((List<?>) value).getNode());
                    }
                    else if (value instanceof Map){
                        ((ArrayNode) this.node).add(new JsonImpl((Map<?,?>) value).getNode());
                    }
                }
                catch (IllegalArgumentException e) {
                    throw e;
                }
            }
            else if (value instanceof JsonImpl){
                ((ArrayNode) this.node).add(((JsonImpl) value).getNode());
            }
            else {
                throw new IllegalArgumentException("Second arg is not valid JSON element");
            }
        }
        else {
            throw new IllegalAccessException("JSON element is not an array");
        }
        return this;
    }*/

//#endregion deprec
}
