using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace test_webapp.Pages
{
    public class TestViewModel : PageModel
    {
        private readonly ILogger<TestViewModel> _logger;

        public TestViewModel(ILogger<TestViewModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }
    }
}
