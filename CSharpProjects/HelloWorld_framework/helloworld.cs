using System;

namespace HelloWorld{
    class Program{
        static void Main(string[] args){
            Console.WriteLine("Hello World! from .net framework");
            Console.WriteLine("press [Enter] to exit");
            while (Console.ReadKey().Key != ConsoleKey.Enter) {}
        }
    }
}