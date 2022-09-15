import { RandomBetween } from '../FunctionsFolder/Functions.js';
export class RandomBuilder{
    constructor(array){
        this.array = [];
        if (typeof(array) === 'object') {
            let maxI = 0;
            this.array = [];
            if (Array.isArray(array)) {
                array.forEach((nextObj)=>{
                    maxI += nextObj.value;
                    return nextObj.key;
                });
                this.array = array;
            }
            else {
                for (const key in array) {
                    if (Object.hasOwnProperty.call(array, key)) {
                        this.array.push({key:key,value:array[key]});
                    }
                }
            }
            this.max = maxI;
        }
    }
    set(array){
        this.array=[];
        if (typeof(array) === 'object') {
            let maxI = 0;
            if (Array.isArray(array)) {
                array.forEach((nextObj)=>{
                    maxI += nextObj.value;
                    return nextObj.key;
                });
                this.array = array;
            }
            else {
                for (const key in array) {
                    if (Object.hasOwnProperty.call(array, key)) {
                        this.array.push({key:key,value:array[key]});
                    }
                }
            }
            this.max = maxI;
        }
    }
    next(){
        let Rand = RandomBetween(this.max,0);
        let last = 0;
        for (let index = 0; index < this.array.length; index++) {
            const element = this.array[index];
            last += element.value;
            if (Rand<last) {
                return element;
            }
        }
        return null;
    }
}

export class TheMap{
    *[Symbol.iterator](){
        for (const playerName in this) {
            if (Object.hasOwnProperty.call(this, playerName)) {
                yield playerName;
            }
        }
   }
}