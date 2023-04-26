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
    public abstract class WebSocketHandler
    {
        protected ConnectionManager WebSocketConnectionManager { get; set; }


        public WebSocketHandler(ConnectionManager webSocketConnectionManager){
            WebSocketConnectionManager = webSocketConnectionManager;
        }

        public async Task HandleClient (WebSocket socket, String socketId, Action<WebSocketReceiveResult, byte[]> handleMessage){
            var buffer = new byte[1024 * 4];
            while (socket.State == WebSocketState.Open){
                try{
                    WebSocketReceiveResult result = await socket.ReceiveAsync(
                        buffer: new ArraySegment<byte>(buffer),
                        cancellationToken: CancellationToken.None
                    );
                    handleMessage(result, buffer);
                }
                catch (Exception e){
                    WebSocketConnectionManager.AbortSocket(socketId);
                    Console.WriteLine("Caught Exception ::\n\t"+e.Message/*+"\n"+e.StackTrace"*/);
                    break;
                }                
            }
        }


        public virtual async Task<String> OnConnected(WebSocket socket){
            //return WebSocketConnectionManager.AddSocket(socket);
            return await Task.Run( () => WebSocketConnectionManager.AddSocket(socket) );
        }


        public virtual async Task OnDisconnected(WebSocket socket){
            await WebSocketConnectionManager.RemoveSocket(WebSocketConnectionManager.GetId(socket));
        }


        public async Task SendMessageAsync (WebSocket socket, string message){
            if(socket.State != WebSocketState.Open)
                return;
            await socket.SendAsync(
                buffer: new ArraySegment<byte>(
                    array: Encoding.ASCII.GetBytes(message),
                    offset: 0,
                    count: message.Length
                ),
                messageType: WebSocketMessageType.Text,
                endOfMessage: true,
                cancellationToken: CancellationToken.None
            );
        }


        public async Task SendMessageAsync (string socketId, string message){
            await SendMessageAsync(WebSocketConnectionManager.GetSocketById(socketId), message);
        }


        public async Task SendMessageToAllAsync (string message){
            foreach(var pair in WebSocketConnectionManager.GetAll())
            {
                if(pair.Value.State == WebSocketState.Open)
                    await SendMessageAsync(pair.Value, message);
            }
        }

        public abstract Task OnMessage (WebSocket socket, WebSocketReceiveResult result, byte[] buffer);
    }
}