package ruestgeo.warehousewars.server.jakarta;

import ruestgeo.utils.json.wrapper.Json;
import ruestgeo.utils.json.wrapper.JsonFactory;

import jakarta.websocket.DecodeException;
import jakarta.websocket.Decoder;
import jakarta.websocket.EndpointConfig;




public class MessageDecoder implements Decoder.Text<Json> {
	  
    @Override
    public Json decode(String message) throws DecodeException {
        try {
            return JsonFactory.parse(message);
        }
        catch (IllegalArgumentException e){
            throw new DecodeException(message, e.toString());
        }
    }
 
    @Override
    public boolean willDecode(String message) {
        return (message != null);
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