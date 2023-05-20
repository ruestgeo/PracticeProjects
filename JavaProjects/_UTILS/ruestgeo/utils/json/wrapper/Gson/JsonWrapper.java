package ruestgeo.utils.json.wrapper.Gson;

import ruestgeo.utils.json.wrapper.Json;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Map.Entry;

import com.google.gson.Gson; 
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.JsonIOException;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
//import com.google.gson.JsonNull;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSyntaxException;
import com.google.gson.stream.JsonReader;




/** 
 * Abstraction of a JSON encoder/decoder via wrapper
 * - gson
 */
public class JsonWrapper implements Json {
    private JsonElement element;

    static final Gson gson = new GsonBuilder().serializeNulls().setPrettyPrinting().create(); 


    public static Json parse (String json) throws IllegalArgumentException {
        try {
            return new JsonWrapper(JsonParser.parseString(json));
        } 
        catch (JsonSyntaxException e) {
            throw new IllegalArgumentException(e);
        }
    }


    public static Json parse (File file) throws IOException {
        try{
            JsonReader reader = gson.newJsonReader(new FileReader(file));
            return new JsonWrapper(JsonParser.parseReader(reader));
        }
        catch (JsonIOException | JsonSyntaxException e){
            throw new IOException(e);
        }
    }




//#region constructor

    private JsonWrapper (JsonElement val) {
        this.element = val;
    }


    /** Create  */
    public JsonWrapper () {
        this.element = new JsonObject();
    }

    public JsonWrapper (String val) {
        this.element = new JsonPrimitive(val);
    }


    public JsonWrapper (Boolean val) {
        this.element = new JsonPrimitive(val);
    }


    public JsonWrapper (Byte val) {
        this.element = new JsonPrimitive(val);
    }
    public JsonWrapper (Short val) {
        this.element = new JsonPrimitive(val);
    }
    public JsonWrapper (Integer val) {
        this.element = new JsonPrimitive(val);
    }
    public JsonWrapper (Long val) {
        this.element = new JsonPrimitive(val);
    }
    public JsonWrapper (BigInteger val) {
        this.element = new JsonPrimitive(val);
    }
    public JsonWrapper (Float val) {
        this.element = new JsonPrimitive(val);
    }
    public JsonWrapper (Double val) {
        this.element = new JsonPrimitive(val);
    }
    public JsonWrapper (BigDecimal val) {
        this.element = new JsonPrimitive(val);
    }


    public JsonWrapper (List<Json> val) {
        JsonArray array = new JsonArray(val.size());
        if (val != null){
            for (Json json : val){
                array.add(((JsonWrapper) json).getElement());
            }
        }
        this.element = array;
    }


    public JsonWrapper (Map<String,Json> val) {
        JsonObject object = new JsonObject();
        if (val != null){
            for (Entry<String,Json> entry : val.entrySet()){
                object.add(
                    entry.getKey(), 
                    ((JsonWrapper) entry.getValue()).getElement() 
                );
            }
        }
        this.element = object;
    }


    public JsonWrapper (File file) throws IOException {
        try{
            JsonReader reader = gson.newJsonReader(new FileReader(file));
            this.element = JsonParser.parseReader(reader);
        }
        catch (JsonIOException | JsonSyntaxException e){
            throw new IOException(e);
        }
    }

//#endregion constructor




//#region public-methods

//#region get

    public Json get (String key) {
        if (this.element.isJsonObject()){
            if (this.element.getAsJsonObject().has(key)){
                return new JsonWrapper(this.element.getAsJsonObject().get(key));
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }



    public Json get (Integer index) {
        if (this.element.isJsonArray()){
            if (this.element.getAsJsonArray().size() > index && index >= 0){
                return new JsonWrapper(this.element.getAsJsonArray().get(index));
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }



    public String getString () {
        return this.getString(null);
    }

    public String getString (String _default) {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isString()){
            return this.element.getAsJsonPrimitive().getAsString();
        }
        else {
            return _default;
        }
    }



    public Boolean getBoolean () {
        return this.getBoolean(null);
    }

    public Boolean getBoolean (Boolean _default) {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isBoolean()){
            return this.element.getAsJsonPrimitive().getAsBoolean();
        }
        else {
            return _default;
        }
    }



    public Byte getByte () throws ArithmeticException {
        return this.getByte(null);
    }

    public Byte getByte (Byte _default) throws ArithmeticException {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                return this.element.getAsByte();
            }
            catch (NumberFormatException e){
                throw new ArithmeticException("Cannot cast number to byte;    "+e);
            }
        }
        else {
            return _default;
        }
    }



    public Short getShort () throws ArithmeticException {
        return this.getShort(null);
    }

    public Short getShort (Short _default) throws ArithmeticException {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                return this.element.getAsShort();
            }
            catch (NumberFormatException e){
                throw new ArithmeticException("Cannot cast number to short;    "+e);
            }
        }
        else {
            return _default;
        }
    }



    public Integer getInteger () throws ArithmeticException {
        return this.getInteger(null); 
    }

    public Integer getInteger (Integer _default) throws ArithmeticException {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                return this.element.getAsInt();
            }
            catch (NumberFormatException e){
                throw new ArithmeticException("Cannot cast number to integer;    "+e);
            }
        }
        else {
            return _default;
        }
    }



    public Long getLong () throws ArithmeticException {
        return this.getLong(null);
    }

    public Long getLong (Long _default) throws ArithmeticException {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                return this.element.getAsLong();
            }
            catch (NumberFormatException e){
                throw new ArithmeticException("Cannot cast number to long;    "+e);
            }
        }
        else {
            return _default;
        }
    }



    public BigInteger getBigInteger () {
        return getBigInteger(null);
    }

    public BigInteger getBigInteger (BigInteger _default) {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            return this.element.getAsBigInteger();
        }
        else {
            return _default;
        }
    }



    public Float getFloat () throws ArithmeticException {
        return this.getFloat(null);
    }

    public Float getFloat (Float _default) throws ArithmeticException {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                return this.element.getAsFloat();
            }
            catch (NumberFormatException e){
                throw new ArithmeticException("Cannot cast number to float;    "+e);
            }
        }
        else {
            return _default;
        }
    }



    public Double getDouble () throws ArithmeticException {
        return getDouble(null);
    }

    public Double getDouble (Double _default) throws ArithmeticException {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                return this.element.getAsDouble();
            }
            catch (NumberFormatException e){
                throw new ArithmeticException("Cannot cast number to double;    "+e);
            }
        }
        else {
            return _default;
        }
    }



    public BigDecimal getBigDecimal () {
        return this.getBigDecimal(null);
    }

    public BigDecimal getBigDecimal (BigDecimal _default) {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            return this.element.getAsBigDecimal();
        }
        else {
            return _default;
        }
    }



    public Byte getAsByte () {
        return (byte) this.element.getAsInt();
    }


    public Short getAsShort () {
        return (short) this.element.getAsInt();
    }
    

    public Integer getAsInteger () {
        return this.element.getAsInt();
    }
    

    public Long getAsLong () {
        return this.element.getAsLong();
    }
    

    public Float getAsFloat () {
        return (float) this.element.getAsDouble();
    }


    public Double getAsDouble () {
        return this.element.getAsDouble();
    }


//#endregion get



//#region set

//#region set-object

    public Json set (String key, Json value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, ((JsonWrapper) value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, String value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Boolean value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Byte value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Short value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Integer value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Long value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, BigInteger value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Float value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Double value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, BigDecimal value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, List<Json> value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (String key, Map<String,Json> value) {
        if (this.element.isJsonObject()){
            JsonElement replaced = null;
            if (this.element.getAsJsonObject().has(key))
                replaced = this.element.getAsJsonObject().get(key);
            this.element.getAsJsonObject().add(key, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }

//#endregion set-object



//#region set-array

    public Json set (Integer index, Json value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, ((JsonWrapper) value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, String value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Boolean value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Byte value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Short value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Integer value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Long value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, BigInteger value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Float value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Double value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, BigDecimal value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, List<Json> value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }


    public Json set (Integer index, Map<String,Json> value) {
        if (this.element.isJsonArray()){
            JsonElement replaced = null;
            replaced = this.element.getAsJsonArray().set(index, new JsonWrapper(value).getElement());
            if (replaced == null)  return null;
            return new JsonWrapper(replaced);
        }
        else  return null;
    }

//#endregion set-array



//#region add-array

    public Json add (Json value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(((JsonWrapper) value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (String value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Boolean value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Byte value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Short value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Integer value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Long value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (BigInteger value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Float value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Double value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (BigDecimal value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (List<Json> value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }


    public Json add (Map<String,Json> value) {
        if (this.element.isJsonArray()){
            this.element.getAsJsonArray().add(new JsonWrapper(value).getElement());
            return this;
        }
        else  return null;
    }

//#endregion add-array

//#endregion set



//#region remove

    public Json remove (String key) {
        if (this.element.isJsonObject()){
            if (this.element.getAsJsonObject().has(key)){
                JsonElement removed = this.element.getAsJsonObject().remove(key);
                return new JsonWrapper(removed);
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }


    public Json remove (Integer index) {
        if (this.element.isJsonArray()){
            if (index >= 0 && this.element.getAsJsonArray().size() > index ){
                JsonElement removed = this.element.getAsJsonArray().remove(index);
                return new JsonWrapper(removed);
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }

//#endregion remove



//#region has

public Boolean has (String key) {
    if (this.element.isJsonObject()){
        return this.element.getAsJsonObject().has(key);
    }
    else {
        return null;
    }
}

//#endregion has



//#region is
    public Boolean isNull () {
        return this.element.isJsonNull();
    }


    public Boolean isString () {
        return this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isString();
    }


    public Boolean isBoolean () {
        return this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isBoolean();
    }


    public Boolean isNumber () {
        return this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber();
    }


    public Boolean isByte () {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                this.element.getAsJsonPrimitive().getAsByte();
                return true;
            }
            catch (NumberFormatException e){}
        }
        return false;
    }


    public Boolean isShort () {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                this.element.getAsJsonPrimitive().getAsShort();
                return true;
            }
            catch (NumberFormatException e){}
        }
        return false;
    }


    public Boolean isInteger () {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                this.element.getAsJsonPrimitive().getAsInt();
                return true;
            }
            catch (NumberFormatException e){}
        }
        return false;
    }


    public Boolean isLong () {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                this.element.getAsJsonPrimitive().getAsLong();
                return true;
            }
            catch (NumberFormatException e){}
        }
        return false;
    }


    public Boolean isBigInteger () {
        return this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber();
    }


    public Boolean isFloat () {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                this.element.getAsJsonPrimitive().getAsFloat();
                return true;
            }
            catch (NumberFormatException e){}
        }
        return false;
    }


    public Boolean isDouble () {
        if (this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber()){
            try {
                this.element.getAsJsonPrimitive().getAsDouble();
                return true;
            }
            catch (NumberFormatException e){}
        }
        return false;
    }


    public Boolean isBigDecimal () {
        return this.element.isJsonPrimitive() && this.element.getAsJsonPrimitive().isNumber();
    }


    public Boolean isArray () {
        return this.element.isJsonArray();
    }


    public Boolean isObject () {
        return this.element.isJsonObject();
    }
//#endregion is



//#region iterator

@Override
public Iterator<Json> iterator() {
    Iterator<Json> iter;

    if (this.element.isJsonObject()){
        iter = new Iterator<Json>() {
            private Entry<String, JsonElement> entry = null;
            private Iterator<Entry<String, JsonElement>> iterator = element.getAsJsonObject().entrySet().iterator();
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
                    return new JsonWrapper(this.entry.getValue());
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
                    element.getAsJsonObject().remove(this.entry.getKey());
                    this.removed = true;
                }
            }
        };
    }
    else if (this.element.isJsonArray()){
        iter = new Iterator<Json>() {
            private int index = 0;
            private int size = element.getAsJsonArray().size();
            private boolean removed = false;
    
            @Override
            public boolean hasNext() {
                return ( (index < size)  &&  (element.getAsJsonArray().get(index) != null) );
            }
    
            @Override
            public Json next() {
                if (index >= size){
                    throw new NoSuchElementException("iteration has no more elements");
                }
                else {
                    this.removed = false;
                    return new JsonWrapper(element.getAsJsonArray().get(index++));
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
                    element.getAsJsonArray().remove(index-1);
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
        if (this.element.isJsonArray()){
            return this.element.getAsJsonArray().size();
        }
        else if (this.element.isJsonObject()){
            return this.element.getAsJsonObject().size();
        }
        else return -1;
    }


    /**
     * @return null if an exception is caught
     */
    public String toString () {
        return gson.toJson(this.element);
    }

//#endregion public-methods



//#region private-methods

    private JsonElement getElement (){
        return this.element;
    }

//#endregion private-methods





}
