using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace test_webapp.Pages
{
    public class GetCountModel : PageModel
    {
        private readonly ILogger<GetCountModel> _logger;
        private Model.Counter _counter;

        public GetCountModel(ILogger<GetCountModel> logger, test_webapp.Model.Counter counter)
        {
            _logger = logger;
            _counter = counter;
        }

        public ActionResult OnGet()
        {
            string message = this._counter.incrementCount().ToString();
            return new JsonResult(message);
        }

        public ActionResult GetCount (){
            string message = this._counter.incrementCount().ToString();
            return new JsonResult(message);
        }
    }
}
