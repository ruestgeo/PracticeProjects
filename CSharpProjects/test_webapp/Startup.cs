using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

//using Microsoft.AspNetCore.SpaServices;
//using Microsoft.AspNetCore.SpaServices.AngularCli;
//using System.Net.WebSockets;

namespace test_webapp
{
    public class Startup
    {
        public Startup (IConfiguration configuration){
            Configuration = configuration;
            _webSocketHandler = new ClientHandler(new ConnectionManager());
        }

        public IConfiguration Configuration { get; }
        public WebSocketHandler _webSocketHandler { get; set; }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices (IServiceCollection services){
            services.AddControllers();
            services.AddRazorPages().AddRazorRuntimeCompilation();
            services.AddSingleton( new test_webapp.Model.Counter() ); //shared across views
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure (IApplicationBuilder app, IWebHostEnvironment env){
            if (env.IsDevelopment()){
                app.UseDeveloperExceptionPage();
            }
            else {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints => {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Request}/{action?}/{args?}"
                );
                endpoints.MapRazorPages();
            });


            app.UseWebSockets(new WebSocketOptions(){
                KeepAliveInterval = TimeSpan.FromSeconds(120),
                ReceiveBufferSize = 4 * 1024
            });
            app.Use(async (context, next) => {
                if (context.Request.Path == "/ws"){
                    if (context.WebSockets.IsWebSocketRequest){
                        WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                        String socketId = await _webSocketHandler.OnConnected(webSocket);
                        await _webSocketHandler.HandleClient(webSocket, socketId, async(result, buffer) => {
                            if(result.MessageType == WebSocketMessageType.Text){
                                await _webSocketHandler.OnMessage(webSocket, result, buffer);
                                return;
                            }
                            else if(result.MessageType == WebSocketMessageType.Close){
                                await _webSocketHandler.OnDisconnected(webSocket);
                                return;
                            }
                        });
                    }
                    else {
                        context.Response.StatusCode = 400;
                    }
                }
                else {
                    await next();
                }
            });
        }
    }
}
