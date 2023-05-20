package ruestgeo.warehousewars.server.jakarta;

import ruestgeo.utils.json.wrapper.Json;

import jakarta.websocket.EncodeException;
import jakarta.websocket.Encoder;
import jakarta.websocket.EndpointConfig;





public class MessageEncoder implements Encoder.Text<Json> {
	 
    
    @Override
    public String encode(Json json) throws EncodeException {
        return json.toString();
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