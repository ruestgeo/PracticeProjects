package ruestgeo.test.server.websocket;


import javax.websocket.*;
import com.google.gson.*;



public class MessageDecoder implements Decoder.Text<JsonObject> {
	  
    @Override
    public JsonObject decode(String rawMessage) throws DecodeException {
        return JsonParser.parseString(rawMessage).getAsJsonObject();
    }
 
    @Override
    public boolean willDecode(String rawMessage) {
        return (rawMessage != null);
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