using System;
using testUtils;

namespace testSpace{
    class MainClass{
        static void Main(string[] args){
            try {
                Console.WriteLine("press [Enter] to exit");
                Counter counter = new Counter();
                while (Console.ReadKey().Key != ConsoleKey.Enter) {
                    testUtils.Utils.printNewLine( "key press count is " + counter.getCount() );
                }
            }
            catch (Exception e){
                Console.WriteLine(e.ToString());
                Environment.Exit(1);
            }
            
        }
    }
}
//csc -recurse:.\*.cs -lib:lib\ -reference:testUtils.dll
//make copy of each library and put it in the same directory as the exe (put them all in a new 'release' dir)