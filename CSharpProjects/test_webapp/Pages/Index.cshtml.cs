using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace test_webapp.Pages
{
    public class IndexModel : PageModel
    {
        public String Name => (String) TempData[nameof(Name)]; //Expression-bodied Member
        private readonly ILogger<IndexModel> _logger;
        private Model.Counter _counter;

        public IndexModel(ILogger<IndexModel> logger, test_webapp.Model.Counter counter)
        {
            _logger = logger;
            _counter = counter;
        }

        public void OnGet()
        {
            Console.WriteLine("username: "+this.Name);
        }

        public IActionResult OnPost ([FromForm] String name){
            TempData["Name"] = name; //temporary for the session (gone on reload, new page load)
            return RedirectToPage("Index");
            /* could instead inject a singleton manager to hold username
            and use ajax to update and obtain data
            */
        }

        public String GetCount() {
            return this._counter.getCount().ToString();
        }
    }
}
