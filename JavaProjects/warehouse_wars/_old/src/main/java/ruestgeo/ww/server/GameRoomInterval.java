package ruestgeo.ww.server;

import java.util.TimerTask;

public class GameRoomInterval extends TimerTask {
    private GameRoom room;
    public GameRoomInterval (GameRoom room){
        this.room = room;
    }
    public void run (){
        try{
            room.step();
            room.update();
        }
        catch (Exception e){
            System.err.println("Error occured during game loop for gameroom ["+this.room.getName()+" :: "+this.room.getId()+"]\n"+e);
            e.printStackTrace();
            System.exit(1);
        }
        
    }
}
