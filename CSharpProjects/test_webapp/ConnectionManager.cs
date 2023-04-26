using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
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
    public class ConnectionManager
    {
        private ConcurrentDictionary<String, WebSocket> _sockets = new ConcurrentDictionary<String, WebSocket>();


        public WebSocket GetSocketById (String id){
            return _sockets.FirstOrDefault(p => p.Key == id).Value;
        }


        public ConcurrentDictionary<String, WebSocket> GetAll (){
            return _sockets;
        }


        public String GetId (WebSocket socket){
            return _sockets.FirstOrDefault(p => p.Value == socket).Key;
        }


        public String AddSocket (WebSocket socket){
            String id = CreateConnectionId();;
            return _sockets.TryAdd(id, socket) ? id : null;
        }


        public async Task RemoveSocket (String id){
            WebSocket socket;
            _sockets.TryRemove(id, out socket);

            await socket.CloseAsync(
                closeStatus: WebSocketCloseStatus.NormalClosure,
                statusDescription: "Closed by the ConnectionManager",
                cancellationToken: CancellationToken.None
            );
        }


        public void AbortSocket (String id){
            WebSocket socket;
            _sockets.TryRemove(id, out socket);
            socket.Abort();
        }


        private String CreateConnectionId (){
            return Guid.NewGuid().ToString();
        }
    }
}