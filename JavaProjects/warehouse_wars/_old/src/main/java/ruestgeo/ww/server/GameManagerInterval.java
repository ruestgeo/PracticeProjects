package ruestgeo.ww.server;

import java.util.TimerTask;

public class GameManagerInterval extends TimerTask {
    private GameManager manager;
    public GameManagerInterval (GameManager manager){
        this.manager = manager;
    }
    public void run (){
        try{
            this.manager.cleanUp();
        }
        catch (Exception e){
            System.err.println("Error occured during manager cleanup loop ::\n"+e);
        }
        
    }
}
