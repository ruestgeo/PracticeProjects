package ruestgeo.ww.server;

import java.util.Set;
import java.util.Map.Entry;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
//import java.util.Random;
import java.lang.Math;

//based on https://gist.github.com/quolc/526fdde83d72b32773922fb45d63a367
public class RandomPick<T> {
    private Boolean ready = false;
    private List<Double> buckets;
    private List<Integer> aliases;

    private List<Double> probabilities = new ArrayList<Double>();
    
    private List<T> items = new ArrayList<T>();
    private List<Integer> weights = new ArrayList<Integer>();


    /***
     * Create a random lot that will select an item based on a weighted sampling.
     * @param itemWeights a map of each item and its weight
     */
    public RandomPick (Map<T,Integer> itemWeights){
        Set<Entry <T, Integer>> entries = itemWeights.entrySet();
        for (Entry<T, Integer> entry : entries){
            this.weights.add(entry.getValue());
            this.items.add(entry.getKey());
            this.probabilities.add(0.0); //temp
        }
    }
    /***
     * Create a random lot that will select an item based on a weighted sampling.
     */
    public RandomPick (){}

    
    
    /***
     * Add an item to the set, or modify its weight.
     * @param item the item to add 
     * @param weight the weight of the item
     */
    public void set (T item, Integer weight){
        ready = false;
        if ( this.items.contains(item) ){
            int index = this.items.indexOf(item);
            this.items.set(index, item);
            this.weights.set(index, weight);
            this.probabilities.set(index, 0.0);
        }
        else {
            this.items.add(item);
            this.weights.add(weight);
            this.probabilities.add(0.0); //temp
        }
    }



    /***
     * Add an item in the set if it is not already in the set, otherwise an exception is thrown.
     * @param item
     * @param weight
     * @throws IllegalAccessError if the item is already in the set of items
     */
    public void add (T item, Integer weight) throws IllegalAccessError{
        if ( this.items.contains(item) )
            throw new IllegalAccessError("Item is already in the set of items, use RandomLot.set(item, probability) to force overwrite");
        this.set(item, weight);
    }


    /***
     * Remove an item from the set of items
     * @param item 
     * @throws IllegalStateException if the item is not on the list
     */
    public void remove (T item) throws IllegalStateException{
        ready = false;
        //if not in set, throw error
        if ( !this.items.contains(item) )
            throw new IllegalStateException("Item is not in the list of items");
        int index = this.items.indexOf(item);
        this.items.remove(index);
        this.weights.remove(index);
        this.probabilities.remove(index); //need to recalculate
    }


    /***
     * Remove an item from the set of items only if it has the specified weight
     * @param item 
     * @param weight
     * @throws IllegalStateException if the item weight does not match
     * @throws IllegalAccessError if the item is not on the list
     */
    public void remove (T item, Integer weight) throws IllegalStateException, IllegalAccessError{
        ready = false;
        //if not in set, throw error
        if ( !this.items.contains(item) )
            throw new IllegalAccessError("Item is not in the list of items");
        int index = this.items.indexOf(item);
        if ( this.weights.get(index) != weight )
            throw new IllegalAccessError("Weight does not match the item weight");
        this.items.remove(index);
        this.weights.remove(index);
        this.probabilities.remove(index); //need to recalculate
    }




    /***
     * Calculate the probability of each item (of the respective index) based on
     * the weight of the item and the total of all weights.
     */
    public void calculateProbabilities (){
        var totalWeight = this.weights.stream().reduce(0, Integer::sum);
        for (int i = 0;  i < this.items.size();  i++){
            this.probabilities.set(i,  this.weights.get(i)*1.0 / totalWeight);
        }
    }


    /***
     * Compile the probability tables via Walker's Alias Method.
     * This should be called before using <RandomLot>.getRandom()
     */
    public void compileTable (){
        int numItems = items.size();

        this.calculateProbabilities();

        int remaining = numItems;
        this.buckets = new ArrayList<Double>(Collections.nCopies(numItems, 0D));
        this.aliases = new ArrayList<Integer>(Collections.nCopies(numItems, -1));
        ArrayList<Double> probs = new ArrayList<Double>(this.probabilities);

        while (remaining > 0){
            for (int i = 0;  i < numItems;  i++){
                if ( (this.buckets.get(i) == 0.0) && ((probs.get(i) * numItems) <= 1.0) ){
                    this.buckets.set(i, (probs.get(i) * numItems));
                    probs.set(i, 0.0); 
                    remaining--;
                }
            }
            for (int i = 0;  i < numItems;  i++){
                if ( (probs.get(i) * numItems) > 1.0 ){
                    for (int j = 0;  j < numItems;  j++){
                        if ( (this.buckets.get(j) != 0.0) && (this.aliases.get(j) == -1.0) ){
                            this.aliases.set(j, i);
                            probs.set(i,  probs.get(i) - ((1.0 - this.buckets.get(j)) / numItems) );
                        }
                        if ( (probs.get(i) * numItems) <= 1.0 ){
                            break;
                        }
                    }
                }
            }
        }
        this.ready = true;
    }


    /***
     * Get a random item from the set based on the weight of the item and the total weight of all items
     * @return
     */
    public T getRandom (){
        if ( !this.ready )
            this.compileTable();
        double random = Math.random() * this.items.size();
        int bucketIndex = (int) random;
        if ( (random - bucketIndex) < this.buckets.get(bucketIndex))
            return this.items.get(bucketIndex);
        else 
            return this.items.get(this.aliases.get(bucketIndex));
    }


}
