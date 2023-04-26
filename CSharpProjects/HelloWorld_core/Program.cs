using System;

namespace HelloWorld_core
{
    class Program{
        static void Main(string[] args){
            Console.WriteLine("Hello World! from .net core");
            Console.WriteLine("press [Enter] to exit");
            while (Console.ReadKey().Key != ConsoleKey.Enter) {}
        }
    }
}
