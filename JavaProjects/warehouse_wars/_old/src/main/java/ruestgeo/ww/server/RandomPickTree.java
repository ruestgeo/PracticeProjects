package ruestgeo.ww.server;

import java.util.Set;
import java.util.TreeMap;
import java.util.Map.Entry;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.Random;

public class RandomPickTree<T> {
    private final NavigableMap<Integer, T> map = new TreeMap<Integer, T>();
    private final Random random = new Random();
    private int totalWeight = 0;
    private List<T> items = new ArrayList<T>();
    private List<Integer> weights = new ArrayList<Integer>();
    private List<Integer> accumulativeWeights = new ArrayList<Integer>();


    /***
     * Create a random lot that will select an item based on a weighted sampling.
     * @param itemWeights a map of each item and its weight
     */
    public RandomPickTree (Map<T,Integer> itemWeights){
        Set<Entry <T, Integer>> entries = itemWeights.entrySet();
        for (Entry<T, Integer> entry : entries){
            Integer weight = entry.getValue();
            T item = entry.getKey();
            if ( weight <= 0 ) continue;
            this.weights.add(weight);
            this.items.add(item);
            this.totalWeight += weight;
            this.map.put(this.totalWeight, item);
            this.accumulativeWeights.add(this.totalWeight);
        }        
    }

    /***
     * Create a random lot that will select an item based on a weighted sampling.
     */
    public RandomPickTree (){}

    
    
    /***
     * Add an item to the set, or modify its weight.
     * @param item the item to add 
     * @param weight the weight of the item
     */
    public void set (T item, Integer weight) throws IllegalArgumentException{
        if ( weight <= 0 )
            throw new IllegalArgumentException("Weight cannot be 0 or less");
        if ( this.items.contains(item) ){
            int index = this.items.indexOf(item);
            Integer oldWeight = this.weights.get(index);
            this.weights.set(index, weight);
            int updateWeight = weight - oldWeight;
            this.totalWeight += updateWeight;
            for (int i = index; i < this.items.size(); i++){
                var oldAccWeight = this.accumulativeWeights.get(i);
                map.remove(oldAccWeight);
                this.accumulativeWeights.set(i, oldAccWeight+updateWeight);
                map.put(this.accumulativeWeights.get(i), this.items.get(i));
            }
        }
        else {
            this.items.add(item);
            this.weights.add(weight);
            this.totalWeight += weight;
            this.accumulativeWeights.add(this.totalWeight);
            this.map.put(this.totalWeight, item);
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
        if ( !this.items.contains(item) )
            throw new IllegalStateException("Item is not in the list of items");
        int index = this.items.indexOf(item);
        Integer weight = this.weights.get(index);
        this.weights.set(index, weight);
        for (int i = index+1; i < this.items.size(); i++){
            var oldAccWeight = this.accumulativeWeights.get(i);
            map.remove(oldAccWeight);
            this.accumulativeWeights.set(i, oldAccWeight-weight);
            map.put(this.accumulativeWeights.get(i), this.items.get(i));
        }
        int accWeight = this.accumulativeWeights.get(index);
        this.totalWeight -= accWeight;
        map.remove(accWeight);
        this.accumulativeWeights.remove(index);
        this.weights.remove(index);
        this.items.remove(index);
    }


    /***
     * Remove an item from the set of items only if it has the specified weight
     * @param item 
     * @param weight
     * @throws IllegalStateException if the item weight does not match
     * @throws IllegalAccessError if the item is not on the list
     */
    public void remove (T item, Integer weight) throws IllegalStateException, IllegalAccessError{
        if ( !this.items.contains(item) )
            throw new IllegalAccessError("Item is not in the list of items");
        int index = this.items.indexOf(item);
        if ( this.weights.get(index) != weight )
            throw new IllegalAccessError("Weight does not match the item weight");
        for (int i = index+1; i < this.items.size(); i++){
            var oldAccWeight = this.accumulativeWeights.get(i);
            map.remove(oldAccWeight);
            this.accumulativeWeights.set(i, oldAccWeight-weight);
            map.put(this.accumulativeWeights.get(i), this.items.get(i));
        }
        int accWeight = this.accumulativeWeights.get(index);
        this.totalWeight -= accWeight;
        map.remove(accWeight);
        this.accumulativeWeights.remove(index);
        this.weights.remove(index);
        this.items.remove(index);
    }



    /***
     * Get a random item from the set based on the weight of the item and the total weight of all items
     * (sample with replacement)
     * @return
     */
    public T getRandom (){
        return map.higherEntry(random.nextInt(this.totalWeight)).getValue();
    }

    /***
     * Get a random item from the set based on the weight of the item and the total weight of all items,
     * but decrement its weight by 1 after
     * (sample without replacement)
     * @return
     */
    public T pullRandom (){
        T item;
        try {
            item = map.higherEntry(random.nextInt(this.totalWeight)).getValue();
        } catch (NullPointerException e){
            return null;
        }
        System.out.println(item);
        int index = this.items.indexOf(item);
        int oldWeight = this.weights.get(index);
        this.totalWeight--;
        if ( oldWeight == 1 ){
            int accWeight = this.accumulativeWeights.get(index);
            this.items.remove(index);
            this.weights.remove(index);
            this.accumulativeWeights.remove(index);
            this.map.remove(accWeight);
        }
        else {
            this.weights.set(index, oldWeight-1);
            var oldAccWeight = this.accumulativeWeights.get(index);
            map.remove(oldAccWeight);
            this.accumulativeWeights.set(index, oldAccWeight-1);
            map.put(this.accumulativeWeights.get(index), this.items.get(index));
            index++;
        }
            
        for (int i = index; i < this.items.size(); i++){
            var oldAccWeight = this.accumulativeWeights.get(i);
            map.remove(oldAccWeight);
            this.accumulativeWeights.set(i, oldAccWeight-1);
            map.put(this.accumulativeWeights.get(i), this.items.get(i));
        }
        return item;
    }


}
