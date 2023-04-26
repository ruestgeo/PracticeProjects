using System;
using System.ComponentModel.DataAnnotations;

namespace test_webapp.Model{
    public class Counter{
        private int count = -1;
        public Counter (){
            this.count = 0;
            Console.WriteLine("init counter");
        }
        public int getCount (){
            Console.WriteLine("get count "+this.count);
            return this.count;
        }
        public int incrementCount (){
            Console.WriteLine("increment count "+(this.count+1));
            return (++this.count);
        }
    }
}