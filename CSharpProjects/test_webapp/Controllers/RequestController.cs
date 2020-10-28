using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;


namespace test_webapp.Controllers
{
    public class RequestController : Controller
    {
        private readonly ILogger<RequestController> _logger;
        private Model.Counter _counter;

        public RequestController(ILogger<RequestController> logger, test_webapp.Model.Counter counter)
        {
            _logger = logger;
            _counter = counter;
        }


        public ActionResult HelloWorld (){
            Console.WriteLine("Hello World!");
            return Redirect("/Index");
        }

        public ActionResult GetPressCount (){
            string message = this._counter.incrementCount().ToString();
            return new JsonResult(message);
        }

        [HttpPost]
        public ActionResult readRequestBody ([FromBody] JsonMessage data){
            Console.WriteLine("received type:  " + data.type+"\n message:  " + data.message);
            String value = "test reply";
            return Json("{\"type\": \"dev\", \"message\":\""+value+"\", \"count\":\""+this._counter.getCount()+"\"}");
        }
        [HttpPost]
        public async Task<ActionResult> readRequestBody2 (){
            String rawData = await new StreamReader(Request.Body, Encoding.UTF8).ReadToEndAsync(); //can only read Body stream once
            Console.WriteLine("raw request body:  '" + rawData + "'");
            String value = "test reply2";
            return Json("{\"type\": \"dev\", \"message\":\""+value+"\", \"count\":\""+this._counter.getCount()+"\"}");
        }
    }

    public class JsonMessage {
        public string type { get; set; }
        public string message { get; set; }
        //... etc
    }
}

