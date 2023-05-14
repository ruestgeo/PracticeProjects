package ruestgeo.utils.json.wrapper.types;


public interface JsonBoolean {

    public Boolean isBoolean ();
    
    /** get Boolean if JSON element is boolean
     * @return null if not boolean
     */
    public Boolean getBoolean ();
    
    /** get Boolean if JSON element is boolean
     * @return default if not boolean
     */
    public Boolean getBoolean (Boolean _default);
    
}
