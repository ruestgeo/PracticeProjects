package ruestgeo.utils.json.wrapper.types;


public interface JsonString {

    public Boolean isString ();

    /** get String if JSON element is string
     * @return null if not a string
     */
    public String getString ();

    /** get String if JSON element is string
     * @return default if not a string
     */
    public String getString (String _default);
    
}
