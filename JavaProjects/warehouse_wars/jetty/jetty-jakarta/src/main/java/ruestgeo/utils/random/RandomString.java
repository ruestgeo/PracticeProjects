package ruestgeo.utils.random;

import java.security.SecureRandom;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Random;

/**
 * @see - inspired by https://stackoverflow.com/a/41156
 */
public abstract class RandomString {

    public static final String UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public static final String LOWERCASE_CHARS = UPPERCASE_CHARS.toLowerCase(Locale.ROOT);

    public static final String DIGIT_CHARS = "0123456789";

    public static final String ALPHABETIC_CHARS = UPPERCASE_CHARS + LOWERCASE_CHARS;

    public static final String ALPHANUMERIC_CHARS = ALPHABETIC_CHARS + DIGIT_CHARS;

    public static final String HEX_CHARS = "0123456789abcdef";
    public static final String HEX_CHARS_CAP = "0123456789ABCDEF";

    public static final Random RANDOM_SECURE_GENERATOR = new SecureRandom();
    public static final Random RANDOM_GENERATOR = new Random();


    private static boolean duplicatesAllowed = true;
    private static boolean preservePatternAlphanumerics = true;
    
    


    /** allow duplicate characters in a charSet (default allowed) */
    public static void allowDuplicates (){
        duplicatesAllowed = true;
    }
    /** remove duplicate characters in a charSet (default allowed) */
    public static void removeDuplicates (){
        duplicatesAllowed = false;
    }


    /** preserve the positions of alphanumerics in a pattern (default true) */
    public static void preserveAll (){
        preservePatternAlphanumerics = true;
    }
    /** preserve only the positions of special characters in a pattern (default allowted) */
    public static void preserveOnlySpecial (){
        preservePatternAlphanumerics = false;
    }




    /**
     * Generate a random string.
     */
    public static String generate(int length, Random randomGenerator, String charSet) {
        final Random random = randomGenerator;
        final char[] symbols;
        if (duplicatesAllowed){
            symbols = charSet.toCharArray();
        }
        else {
            symbols = removeDuplicates(charSet).toCharArray();
        }
        final char[] buf = new char[length];
        for (int idx = 0; idx < buf.length; idx++)
            buf[idx] = symbols[random.nextInt(symbols.length)];
        return new String(buf);
    }


    /**
     * Generate a random string.
     */
    public static String generate(int length, Random randomGenerator){
        return generate(length, randomGenerator, ALPHANUMERIC_CHARS);
    }


    /**
     * Generate a random string.
     */
    public static String generate(int length, String charSet){
        return generate(length, RANDOM_SECURE_GENERATOR, charSet);
    }


    /**
     * Generate a random string.
     */
    public static String generate(int length){
        return generate(length, RANDOM_SECURE_GENERATOR, ALPHANUMERIC_CHARS);
    }





    /**
     * Generate a random string via a given pattern.
     * 
     * Any special characters in charSet, if provided, is ignored
     * 
     * Pattern will maintain special characters such as 
     * {@literal `~!@#$%^&*()[]{};:'\|",.<>/ } and spacing
     * 
     * Pattern will maintain position of any alphabetic or numeric characters
     * but will select randomly among the charSet for the respective type 
     * (numerics will only randomize numerics, alphabetics will only pick random alphabetics)
     * 
     * ? in a provided pattern is treated as a wildcard allowing selection 
     * from both alphabetic and numeric characters
     * 
     * @see RandomString.SPECIAL_CHARS
     */
    public static String generate(String pattern, Random randomGenerator, String charSet) {
        final Random random = randomGenerator;
        final char[] symbols;
        symbols = removeSpecialCharacters(charSet).toCharArray();
        final char[] buf = new char[pattern.length()];
        final char[] format = pattern.toCharArray();
        final char[] num = getNumerics(charSet).toCharArray();
        final char[] alpha = getAlphabetics(charSet).toCharArray();
        if ( preservePatternAlphanumerics  &&  num.length > 0  &&  alpha.length > 0 ){
            for (int idx = 0; idx < buf.length; idx++){
                if ( isWildcard(format[idx]) ){
                    buf[idx] = symbols[random.nextInt(symbols.length)];
                }
                else if ( isSpecialCharacter(format[idx]) ){
                    buf[idx] = format[idx];    
                }
                else if ( isAlphabetic(format[idx]) ){
                    buf[idx] = alpha[random.nextInt(alpha.length)];
                }
                else if ( isNumeric(format[idx])){
                    buf[idx] = num[random.nextInt(num.length)];
                }
                else { 
                    buf[idx] = symbols[random.nextInt(symbols.length)];
                }
            }
        }
        else {
            for (int idx = 0; idx < buf.length; idx++){
                if ( isSpecialCharacter(format[idx]) ){
                    buf[idx] = format[idx];    
                }
                else {
                    buf[idx] = symbols[random.nextInt(symbols.length)];
                }
            }
        }
        return new String(buf);
    }


    /**
     * Generate a random string via a given pattern.
     * 
     * Any special characters in charSet, if provided, is ignored
     * 
     * Pattern will maintain special characters such as 
     * {@literal `~!@#$%^&*()[]{};:'\|",.<>/ } and spacing
     * 
     * Pattern will maintain position of any alphabetic or numeric characters
     * but will select randomly among the charSet for the respective type 
     * (numerics will only randomize numerics, alphabetics will only pick random alphabetics)
     * 
     * ? in a provided pattern is treated as a wildcard allowing selection 
     * from both alphabetic and numeric characters
     * 
     * @see RandomString.SPECIAL_CHARS
     */
    public static String generate(String pattern, Random randomGenerator){
        return generate(pattern, randomGenerator, ALPHANUMERIC_CHARS);
    }


    /**
     * Generate a random string via a given pattern.
     * 
     * Any special characters in charSet, if provided, is ignored
     * 
     * Pattern will maintain special characters such as 
     * {@literal `~!@#$%^&*()[]{};:'\|",.<>/ } and spacing
     * 
     * Pattern will maintain position of any alphabetic or numeric characters
     * but will select randomly among the charSet for the respective type 
     * (numerics will only randomize numerics, alphabetics will only pick random alphabetics)
     * 
     * ? in a provided pattern is treated as a wildcard allowing selection 
     * from both alphabetic and numeric characters
     * 
     * @see RandomString.SPECIAL_CHARS
     */
    public static String generate(String pattern, String charSet){
        return generate(pattern, RANDOM_SECURE_GENERATOR, charSet);
    }


    /**
     * Generate a random string via a given pattern.
     * 
     * Any special characters in charSet, if provided, is ignored
     * 
     * Pattern will maintain special characters such as 
     * {@literal `~!@#$%^&*()[]{};:'\|",.<>/ } and spacing
     * 
     * Pattern will maintain position of any alphabetic or numeric characters
     * but will select randomly among the charSet for the respective type 
     * (numerics will only randomize numerics, alphabetics will only pick random alphabetics)
     * 
     * ? in a provided pattern is treated as a wildcard allowing selection 
     * from both alphabetic and numeric characters
     * 
     * @see RandomString.SPECIAL_CHARS
     */
    public static String generate(String pattern){
        return generate(pattern, RANDOM_SECURE_GENERATOR, ALPHANUMERIC_CHARS);
    }



    /**
     * Given a base pattern as a prefix, extend the pattern with an amount of wildcards
     */
    public static String extendPattern(String prefix, Integer amount){
        if (amount < 0)  amount = 0;
        return prefix + "?".repeat(amount);
    }







    private static String removeDuplicates (String str){
        HashSet<String> result = new LinkedHashSet<String>();
        for (String c : str.split("")){
            result.add(c);
        }
        return String.join("", result);
    }


    private static String removeSpecialCharacters (String str){
        return str.replaceAll("[^a-zA-Z0-9]", "");
    }

    private static String getAlphabetics (String str){
        return str.replaceAll("[^a-zA-Z]", "");
    }

    private static String getNumerics (String str){
        return str.replaceAll("[^0-9]", "");
    }


    private static boolean isSpecialCharacter (char c){
        return ALPHANUMERIC_CHARS.indexOf(c) < 0;
    }

    private static boolean isNumeric (char c){
        return DIGIT_CHARS.indexOf(c) >= 0;
    }

    private static boolean isAlphabetic (char c){
        return ALPHABETIC_CHARS.indexOf(c) >= 0;
    }

    private static boolean isWildcard (char c){
        return c == '?';
    }



}
