using System;

namespace testSpace{
    class Counter{
        private int count = -1;
        public Counter (){
            this.count = 0;
        }
        public String getCount (){
            return (++count).ToString();
        }
    }
}