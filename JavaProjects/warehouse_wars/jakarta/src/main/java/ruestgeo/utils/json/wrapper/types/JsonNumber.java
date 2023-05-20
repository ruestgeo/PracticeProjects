package ruestgeo.utils.json.wrapper.types;

import java.math.BigDecimal;
import java.math.BigInteger;

public interface JsonNumber {

    public Boolean isNumber ();
    public Boolean isByte ();
    public Boolean isShort ();
    public Boolean isInteger ();
    public Boolean isLong ();
    public Boolean isBigInteger ();
    public Boolean isFloat ();
    public Boolean isDouble ();
    public Boolean isBigDecimal ();


    /**
     * get Byte if JSON element is a number that can be represented as an byte
     * @return null if not a number
     * @throws ArithmeticException if number cannot be represented as an byte
     */
    public Byte getByte () throws ArithmeticException;

    /**
     * get Short if JSON element is a number that can be represented as an short
     * @return null if not a number
     * @throws ArithmeticException if number cannot be represented as an short
     */
    public Short getShort () throws ArithmeticException;

    /**
     * get Integer if JSON element is a number that can be represented as an integer
     * @return null if not a number
     * @throws ArithmeticException if number cannot be represented as an integer
     */
    public Integer getInteger () throws ArithmeticException;

    /**
     * get Long if JSON element is a number that can be represented as a long
     * @return null if not a number
     * @throws ArithmeticException if number cannot be represented as a long
     */
    public Long getLong () throws ArithmeticException;

    /**
     * get BigInteger if JSON element is a number that can be represented as a BigInteger
     * @return null if not a number
     */
    public BigInteger getBigInteger ();

    /**
     * get Float if JSON element is a number that can be represented as a float
     * @return null if not a number
     * @throws ArithmeticException if number cannot be represented as a float
     */
    public Float getFloat () throws ArithmeticException;

    /**
     * get Double if JSON element is a number that can be represented as a double
     * @return null if not a number
     * @throws ArithmeticException if number cannot be represented as a double
     */
    public Double getDouble () throws ArithmeticException;

    /**
     * get BigDecimal if JSON element is a number that can be represented as a BigDecimal
     * @return null if not a number
     */
    public BigDecimal getBigDecimal ();


    /**
     * get Byte if JSON element is a number that can be represented as an byte
     * @return default if not a number
     * @throws ArithmeticException if number cannot be represented as an byte
     */
    public Byte getByte (Byte _default) throws ArithmeticException;

    /**
     * get Short if JSON element is a number that can be represented as an short
     * @return default if not a number
     * @throws ArithmeticException if number cannot be represented as an short
     */
    public Short getShort (Short _default) throws ArithmeticException;

    /**
     * get Integer if JSON element is a number that can be represented as an integer
     * @return default if not a number
     * @throws ArithmeticException if number cannot be represented as an integer
     */
    public Integer getInteger (Integer _default) throws ArithmeticException;

    /**
     * get Long if JSON element is a number that can be represented as a long
     * @return default if not a number
     * @throws ArithmeticException if number cannot be represented as a long
     */
    public Long getLong (Long _default) throws ArithmeticException;

    /**
     * get BigInteger if JSON element is a number that can be represented as a BigInteger
     * @return default if not a number
     */
    public BigInteger getBigInteger (BigInteger _default);

    /**
     * get Float if JSON element is a number that can be represented as a float
     * @return default if not a number
     * @throws ArithmeticException if number cannot be represented as a float
     */
    public Float getFloat (Float _default) throws ArithmeticException;

    /**
     * get Double if JSON element is a number that can be represented as a double
     * @return default if not a number
     * @throws ArithmeticException if number cannot be represented as a double
     */
    public Double getDouble (Double _default) throws ArithmeticException;

    /**
     * get BigDecimal if JSON element is a number that can be represented as a BigDecimal
     * @return default if not a number
     */
    public BigDecimal getBigDecimal (BigDecimal _default);



    /**
     * get JSON element as Byte.
     * (not protected against overflow/underflow)
     */
    public Byte getAsByte ();

    /**
     * get JSON element as Short.
     * (not protected against overflow/underflow)
     */
    public Short getAsShort ();

    /**
     * get JSON element as Integer.
     * (not protected against overflow/underflow)
     */
    public Integer getAsInteger ();

    /**
     * get JSON element as Long.
     * (not protected against overflow/underflow)
     */
    public Long getAsLong ();

    /**
     * get JSON element as Float.
     * (not protected against overflow/underflow)
     */
    public Float getAsFloat ();

    /**
     * get JSON element as Double.
     * (not protected against overflow/underflow)
     */
    public Double getAsDouble ();

}
