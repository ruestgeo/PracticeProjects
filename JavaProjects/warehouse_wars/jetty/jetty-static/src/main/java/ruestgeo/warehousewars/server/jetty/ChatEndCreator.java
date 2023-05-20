package ruestgeo.warehousewars.server.jetty;

import org.eclipse.jetty.websocket.server.JettyServerUpgradeRequest;
import org.eclipse.jetty.websocket.server.JettyServerUpgradeResponse;
import org.eclipse.jetty.websocket.server.JettyWebSocketCreator;



public class ChatEndCreator implements JettyWebSocketCreator {
    @Override
    public Object createWebSocket(JettyServerUpgradeRequest request, 
        JettyServerUpgradeResponse response)
    {
        return new ChatEndSession();
    }
}