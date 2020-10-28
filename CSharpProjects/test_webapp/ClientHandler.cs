using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


namespace test_webapp
{
    public class ClientHandler : WebSocketHandler
    {
        public ClientHandler (ConnectionManager webSocketConnectionManager) : base(webSocketConnectionManager){
            Console.WriteLine("INITIALIZED ClientHandler");
        }


        public override async Task<String> OnConnected (WebSocket socket){
            String socketId = await base.OnConnected(socket);
            Console.WriteLine("CONNECTED:  "+socketId);
            return socketId;
        }


        public override Task OnDisconnected (WebSocket socket){
            Console.WriteLine("DISCONNECTED:  "+WebSocketConnectionManager.GetId(socket));
            return base.OnDisconnected(socket);
        }


        public override Task OnMessage (WebSocket socket, WebSocketReceiveResult result, byte[] buffer){
            String socketId = WebSocketConnectionManager.GetId(socket);
            String message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            Console.WriteLine("RECEIVED from ["+socketId+"] ::   \n\t"+message);
            return Task.Run(() => SendMessageAsync(socket, "{\"type\":\"devReply\", \"content\":\"Hello Client!\", \"client_message\":"+message+"}"));
        }
    }
}