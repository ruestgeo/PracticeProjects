package ruestgeo.ww.server.actors;


import ruestgeo.ww.server.GameRoom;
//



public class Box extends Misc {
    private final short variant;
    /***
     * A Box is a Player movable actor that is used to terminate enemy Mob actors,
     * usually by surrounding those Mob actors with Box actors
     * @param room the GameRoom this Box was spawned in
     * @param x position
     * @param y position
     */
    public Box (GameRoom room, int x, int y){
        super(room,x,y);
        this.variant = (short) ((Math.random() * 2) + 1); //1, 2 or 3
    }


    //Box is not dangerous to a Player
    public Boolean isDangerous() {
        return false;
    }

    
    //Box can only be moved by Player, Box, Pusher(Mob), Mimic(Mob)
    public Boolean isPushableBy(Actor actor) {
        return ( (Player.class.isInstance(actor)) || (Pusher.class.isInstance(actor)) 
            || (Box.class.isInstance(actor)) || (Mimic.class.isInstance(actor)) );
    }


    //Box can be pulled by a Player
    public Boolean isPullableBy(Actor actor) {
        return Player.class.isInstance(actor);
    }

    
    //Box can only push another Box actor or Mimics(Mob)
    public Boolean canPush(Actor actor) {
        return (Box.class.isInstance(actor) || Mimic.class.isInstance(actor));
    }

    
    //Box can only be moved by Player, Box, Pusher(Mob), Mimic(Mob)
    public Boolean requestMove (Actor requestor, int dx, int dy) {
        //System.out.println("requestMove Box["+this.position[0]+","+this.position[1]+"] by "+requestor.getClass().getSimpleName());
        if ( !(Player.class.isInstance(requestor)) && !(Pusher.class.isInstance(requestor)) 
            && !(Box.class.isInstance(requestor)) && !(Mimic.class.isInstance(requestor)) )
            return false;
        short[] pos = this.getPosition();
        Actor actor = this.room.getActor(pos[0]+dx, pos[1]+dy);
        //System.out.println("actorInDir "+(actor==null? "null": actor.getClass().getSimpleName()));
        if ( actor != null){
            if ( actor.requestMove(this, dx, dy) ){
                this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
                return true;
            }
            else 
                return false;
        }
        //else actor==null
        this.room.setActorPosition(this, pos[0]+dx, pos[1]+dy);
        return true;
    }

    //Box (currently) cannot be destroyed
    public Boolean destroy(Actor actor) {
        return false;
    }

    /***
     * Return the box style variant
     * @return the variant number from 1 to 3
     */
    public short getVariant(){
        return 0;
    }
}
