package ruestgeo.utils.random;

import java.util.Random;

public abstract class RandomNumber {

    public static final Random RANDOM = new Random();

    public static int getInt(int a, int b) {
        int max;
        int min;
        if (a == b){
            return a;
        }
		else if (a > b) {
			min = b;
            max = a;
		}
        else {
            min = a;
            max = b;
        }
		return RANDOM.nextInt((max - min) + 1) + min;
	}


    
}
