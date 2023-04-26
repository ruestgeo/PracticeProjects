package ruestgeo.test.server;


/***
 * server configs
 */
public class Configs {
    int port;
    String address;



    public int getPort(){
        return this.port;
    }
    public void setPort(int val){
        this.port = val;
    }

    public String getAddress(){
        return this.address;
    }
    public void setAddress(String val){
        this.address = val;
    }
}
