package ruestgeo.ww.server;

import com.google.gson.*;
import java.util.Map;
import java.util.Random;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

public class GameRoomConfigs {
    /* 
    configs_json = 
    {
        "intervalTime" : 0
        "maxNumPlayers" : 0
        "maxHealthPoints" : 0

        "gridWidth" : 0
        "gridHeight" : 0

        "numBoxes" : 0
        "numWalls" : 0

        "numRandomMobs" : 0
        "randomMobWeights" : {
            "Bouncer" : 0
            "Pusher" : 0
            "Wanderer" : 0
            "Charger" : 0
            "Crawler" : 0
            "Warper" : 0
            "Mimic" : 0
        }

        "fixedMobAmounts" : {
            "numBouncers" : 0
            "numPushers" : 0
            "numWanderers" : 0
            "numChargers" : 0
            "numCrawlers" : 0
            "numWarpers" : 0
            "numMimics" : 0
        }
    }
    */

    /* for example on 8x8 grid then up to 50% capacity 
    *   5~15% mobs (3~9)
    *   15~25% boxes (9~16)
    *   0~10% walls (0~6)
        (min 15% boxes but up to 20% walls)
    */
    public final static double BOX_RATIO_MIN = 0.15;
    public final static double BOX_RATIO_MAX = 0.25;

    public final static double WALL_RATIO_MIN = 0;
    public final static double WALL_RATIO_MAX = 0.1;

    public final static double MOBS_RATIO_MIN = 0.0;//0.05; //DEBUG
    public final static double MOBS_RATIO_MAX = 0.15;

    public final static short MAX_PLAYERS_CAPACITY = 8;


    public final static short STEP_INTERVAL_MIN = 100; //ms
    public final static short STEP_INTERVAL_MAX = 1000; //ms

    public final static short HEALTH_POINT_MAX = 16; //ms



    public final static short DEFAULT_STEP_INTERVAL = 200; //ms
    public final static short DEFAULT_MAX_PLAYERS = 4;
    public final static short DEFAULT_HEALTH = 3;
    
    public final static short DEFAULT_GRID_WIDTH = 10;
    public final static short DEFAULT_GRID_HEIGHT = 10;
    public final static short MAX_GRID_WIDTH = 256;
    public final static short MAX_GRID_HEIGHT = 256;

    //public final static short DEFAULT_NUM_BOXES = 16;
    //public final static short DEFAULT_NUM_WALLS = 3;
    public final static double DEFAULT_BOXES_RATIO = 0.2;
    
    //public final static short DEFAULT_NUM_RANDOM_MOBS = 4;
    public final static short DEFAULT_RANDOM_MOB_WEIGHT = 1;
    public final static short TOTAL_MOB_TYPES = 7;

    public final static short DEFAULT_NUM_FIXED_MOB = 0; //default for each type


    public final short intervalTime;
    public final short maxNumPlayers;
    public final short maxHealthPoints;

    public final short gridWidth;
    public final short gridHeight;

    public final short numBoxes;
    public final short numWalls;

    public final short numRandomMobs;
    public final Map<String, Integer> randomMobWeights;
    public final int totalMobWeight;

    public final int numFixedMobs;
    public final Map<String, Integer> fixedMobAmounts;

    

    /***
     * Factory method of creating a GameRoomConfigs via a client configs json.
     * Any missing fields will use default values.
     * @param json the json provided by the initializing client
     * @return a GameRoomConfigs instance set according to the configs json
     */
    public static GameRoomConfigs parseConfigs (String json){
        return new GameRoomConfigs(json);
    }



    /***
     * Parse the configs json, any missing fields or fields with incorrect types are set to default.
     * (visibility hidden to enforce use of the static factory method, as practice)
     * @param json the provided json
     */
    private GameRoomConfigs (String json){
        JsonObject configs = JsonParser.parseString(json).getAsJsonObject();
        short temp_short;

        temp_short = GameRoomConfigs.DEFAULT_STEP_INTERVAL;
        try{
            temp_short =  (configs.has("intervalTime") ? configs.get("intervalTime").getAsShort() : GameRoomConfigs.DEFAULT_STEP_INTERVAL);
            if (configs.has("intervalTime")){
                short temp_short2 = configs.get("intervalTime").getAsShort();
                if ((temp_short2 < GameRoomConfigs.STEP_INTERVAL_MAX) 
                && (temp_short2 > GameRoomConfigs.STEP_INTERVAL_MIN)){
                    temp_short = temp_short2;
                }
            }
        }
        catch (Exception e){}
        this.intervalTime = temp_short;



        temp_short = GameRoomConfigs.DEFAULT_MAX_PLAYERS;
        try{
            if ( configs.has("maxNumPlayers") ){
                short temp_short2 = configs.get("maxNumPlayers").getAsShort();
                if ( (temp_short2 < GameRoomConfigs.MAX_PLAYERS_CAPACITY)
                && (temp_short2 > 1) );
                temp_short = temp_short2;
            }
        }
        catch (Exception e){}
        this.maxNumPlayers = temp_short;



        temp_short = GameRoomConfigs.DEFAULT_HEALTH;
        try{
            if ( configs.has("maxHealthPoints") ){
                short temp_short2 = configs.get("maxHealthPoints").getAsShort();
                if ( (temp_short2 < GameRoomConfigs.HEALTH_POINT_MAX) && (temp_short2 >= 0) )
                    temp_short = temp_short2;
            }
        }
        catch (Exception e){}
        this.maxHealthPoints = temp_short;
        


        temp_short = GameRoomConfigs.DEFAULT_GRID_WIDTH;
        try{
            if ( configs.has("gridWidth") ){
                short temp_short2 = configs.get("gridWidth").getAsShort();
                if ( (temp_short2 < GameRoomConfigs.MAX_GRID_WIDTH) && (temp_short2 >= 8) )
                    temp_short = temp_short2;
            }
        }
        catch (Exception e){}
        this.gridWidth = temp_short;



        temp_short = GameRoomConfigs.DEFAULT_GRID_HEIGHT;
        try{
            if ( configs.has("gridHeight") ){
                short temp_short2 = configs.get("gridHeight").getAsShort();
                if ( (temp_short2 < GameRoomConfigs.MAX_GRID_HEIGHT) && (temp_short2 >= 8) )
                    temp_short = temp_short2;
            }
        }
        catch (Exception e){}
        this.gridHeight = temp_short;
        int gridSpace = this.gridHeight *this.gridWidth;
        int miscSpace = (int) (gridSpace*(GameRoomConfigs.BOX_RATIO_MAX+GameRoomConfigs.WALL_RATIO_MAX));


        
        temp_short = (short) Math.round(GameRoomConfigs.DEFAULT_BOXES_RATIO * gridSpace);
        try{
            if (configs.has("numBoxes")){
                short temp_short2 = configs.get("numBoxes").getAsShort();
                if ( (temp_short2 < gridSpace*GameRoomConfigs.BOX_RATIO_MAX) 
                && (temp_short2 > gridSpace*GameRoomConfigs.BOX_RATIO_MIN) ){
                    temp_short = temp_short2;
                }
            }
        }
        catch (Exception e){}
        this.numBoxes = temp_short;
        miscSpace -= this.numBoxes;


        
        short maxWalls = (short) miscSpace;
        short minWalls = (short) Math.round(GameRoomConfigs.WALL_RATIO_MIN * gridSpace);
        temp_short = minWalls;
        try{
            if (configs.has("numWalls")){
                short temp_short2 = configs.get("numWalls").getAsShort();
                if ( (temp_short2 < maxWalls) && (temp_short2 > minWalls) ){
                    temp_short = temp_short2;
                }
            }
        }
        catch (Exception e){}
        this.numWalls = temp_short;


        Map<String, Integer> temp = new HashMap<String, Integer>();
        int val = GameRoomConfigs.DEFAULT_RANDOM_MOB_WEIGHT;
        if ( configs.has("randomMobWeights") ){
            JsonObject weights;
            try {
                weights = configs.get("randomMobWeights").getAsJsonObject();
            }
            catch (Exception e){
                weights = new JsonObject();
            }
            try{
                temp.put("Bouncer", (weights.has("Bouncer") ? weights.get("Bouncer").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Bouncer", val);
            }
            try{
                temp.put("Pusher", (weights.has("Pusher") ? weights.get("Pusher").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Pusher", val);
            }
            try{
                temp.put("Wanderer", (weights.has("Wanderer") ? weights.get("Wanderer").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Wanderer", val);
            }
            try{
                temp.put("Charger", (weights.has("Charger") ? weights.get("Charger").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Charger", val);
            }
            try{
                temp.put("Crawler", (weights.has("Crawler") ? weights.get("Crawler").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Crawler", val);
            }
            try{
                temp.put("Warper", (weights.has("Warper") ? weights.get("Warper").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Warper", val);
            }
            try{
                temp.put("Mimic", (weights.has("Mimic") ? weights.get("Mimic").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Mimic", val);
            }
            this.randomMobWeights = Collections.unmodifiableMap(temp);
        }
        else {    
            temp.put("Bouncer",val);
            temp.put("Pusher",val);
            temp.put("Wanderer",val);
            temp.put("Charger",val);
            temp.put("Crawler",val);
            temp.put("Warper",val);
            temp.put("Mimic",val);
            this.randomMobWeights = Collections.unmodifiableMap(temp);
        }
        

        this.totalMobWeight =  this.randomMobWeights.values().stream().reduce(0, Integer::sum);
    



        temp = new HashMap<String, Integer>();
        val = GameRoomConfigs.DEFAULT_NUM_FIXED_MOB;
        if ( configs.has("fixedMobAmounts") ){
            JsonObject amounts;
            try {
                amounts = configs.get("fixedMobAmounts").getAsJsonObject();
            }
            catch (Exception e){
                amounts = new JsonObject();
            }
            try{
                temp.put("Bouncer", (amounts.has("numBouncers") ? amounts.get("numBouncers").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Bouncer", val);
            }
            try{
                temp.put("Pusher", (amounts.has("numPushers") ? amounts.get("numPushers").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Pusher", val);
            }
            try{
                temp.put("Wanderer", (amounts.has("numWanderers") ? amounts.get("numWanderers").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Wanderer", val);
            }
            try{
                temp.put("Charger", (amounts.has("numChargers") ? amounts.get("numChargers").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Charger", val);
            }
            try{
                temp.put("Crawler", (amounts.has("numCrawlers") ? amounts.get("numCrawlers").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Crawler", val);
            }
            try{
                temp.put("Warper", (amounts.has("numWarpers") ? amounts.get("numWarpers").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Warper", val);
            }
            try{
                temp.put("Mimic", (amounts.has("numMimics") ? amounts.get("numMimics").getAsShort() : val) );
            }
            catch (Exception e){
                temp.put("Mimic", val);
            }
            this.fixedMobAmounts = Collections.unmodifiableMap(temp);
        }
        else {    
            temp.put("numBouncers",val);
            temp.put("numPushers",val);
            temp.put("numWanderers",val);
            temp.put("numChargers",val);
            temp.put("numCrawlers",val);
            temp.put("numWarpers",val);
            temp.put("numMimics",val);
            this.fixedMobAmounts = Collections.unmodifiableMap(temp);
        }

        

        this.numFixedMobs = this.fixedMobAmounts.values().stream().reduce(0, Integer::sum);



        int minMobs = (int) Math.round(GameRoomConfigs.MOBS_RATIO_MIN * gridSpace);
        /*DEBUG*/ if ( minMobs < 1 ) minMobs = 1;
        int numMobsRequired = minMobs - this.numFixedMobs;
        int numMobsMax = (int) Math.round(gridSpace*GameRoomConfigs.MOBS_RATIO_MAX) - this.numFixedMobs;
        if ( numMobsRequired < 0 ) 
            numMobsRequired = 0;
        temp_short = (short) numMobsRequired;
        try{
            if (configs.has("numRandomMobs")){
                short temp_short2 = configs.get("numRandomMobs").getAsShort();
                if ( (temp_short2 < numMobsMax) && (temp_short2 >= numMobsRequired) ){
                    temp_short = temp_short2;
                }
            }
        }
        catch (Exception e){}
        this.numRandomMobs = temp_short;
    }

}
