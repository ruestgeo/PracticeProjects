package ruestgeo.test.server.websocket;


import javax.websocket.*;
import com.google.gson.*;



public class MessageEncoder implements Encoder.Text<JsonObject> {
	 
    private static Gson gson = new Gson();
    
    @Override
    public String encode(JsonObject jsonObj) throws EncodeException {
        return gson.toJson(jsonObj);
    }
    
    @Override
    public void init(EndpointConfig endpointConfig) {
        return;
    }
    
    @Override
    public void destroy() {
        return;
    }
}