package ruestgeo.utils.json.transform.types;


public abstract class JsonElementBase<T> {
    //protected JsonType type = JsonType.NULL;
    protected T value;

    //public JsonType getType (){ return type; }

    public T get (){
        return this.value;
    }
    public void set (T val){
        this.value = val;
    }
}
