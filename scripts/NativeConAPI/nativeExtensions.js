import {World,world,EntityHealthComponent, MinecraftDimensionTypes} from 'mojang-minecraft';
const IsGeneratorSymbol = Symbol('IsGenerator');

const types = ['', 'k', 'M', 'G', 'T'];

const ObjectExtension = {
    forEach: function(callBack)
    {
        for (const [key, value] of Object.entries(this)) {
            callBack(value,key);
        }
    },
    length: function () {
        return Object.entries(this).length;
    },
    entries: function(){
        return Object.entries(this);
    },
    assign:function(object){
        Object.assign(this,object);
        return this;
    },
    map(callBack){
        const Array=[];
        for (const key in this) {
            if (Object.hasOwnProperty.call(this, key)) {
                const element = this[key];
                Array.push(callBack(element,key,this));
            }
        }
        return Array;
    },
    getValue(key,...params){
        return (typeof(this[key]) === 'function')?this[key].call(this,...params):this[key];
    },
    toArray(){
        const array = [];
        for (const key in this) {
            if (Object.hasOwnProperty.call(this, key)) {
                array.push(this[key]);
            }
        }
        return array;
    },
    *[Symbol.iterator](){
        for (const key in this) {
            if (Object.hasOwnProperty.call(this, key)) yield key;
        }
    }
};
const ArrayExtension = {
    includesOf(array2){
        return this.some((value)=>array2.includes(value));
    },
    filterMap(callBack){
        return this.reduce((arr,v,i,a)=>{
            const value = callBack(v,i,a,ArrayType.nullSlot);
            (value===ArrayType.nullSlot)?null:arr.push(value);
            return arr;
        },[]);
    }
};
const ArrayType = {
    nullSlot:Symbol('NullSlot')
}
const NumberExtension = {
    trunc:function() {
        return Math.trunc(Number(this));
    },
    fTrunc:function() {
      return ~~this;  
    },
    unitFormat: function (place = 1) {
        return (this / 10 ** (~~(Math.log10(this) / 3) * 3)).toFixed(place) + types[~~(Math.log10(this) / 3)];
    }
};
const NumberTypeExtension = {
    random(max,min = 0){
        return Math.random() * (max - min) + min;
    },
    trunc(num) {
        return Math.trunc(Number(num));
    },
    fTrunc() {
      return ~~num;  
    },
    isNotNaN(num){
        return !Number.isNaN(Number(num));
    },
    newNaN(num,fallBack){
        return Number.isNaN(Number(num))?fallBack:Number(num);
    }
}
const StringExtension = {
    startsWithSub(text){
        return this.startsWith(text)?this.substring(text.length):this;
    },
    toMinecraft(){
        return (this.includes(':')?'':'minecraft:') + this;
    },
    setModify(){return this.replaceAll('\\','\\\\').replaceAll(/"/g,'\\"');},
    getModify(){return this.replaceAll('\\\\','\\').replaceAll(/\\"/g, '"');}
};
const DateExtension = {
    toHHMMSS(){
        return this.toTimeString().split(' ')[0];
    }
};
const FunctionExtension = {
};
const FunctionTypeExtension = {
    runAsAsync(...params){
        if (this instanceof AsyncFunction) return this(...params);
        if (this instanceof GeneratorFunction) return Generator.runAsync.call(this,...params);
        if (this instanceof Function) return new Promise((res,rej) => {
            try {
                res(this(...params));
            } catch (error) {
                rej(error);
            }
        });
    },
    *runAsGenerator(func,...params){
        if (func instanceof AsyncFunction) return yield func(...params);
        if (func instanceof GeneratorFunction) return yield* func(...params);
        if (func instanceof Function) return func(...params);
        if (Generator.isGenerator(func)) return yield* func;
        if (typeof(func) === 'object' && (func instanceof Promise || 'then' in func)) return yield func;
        else return func;
    }
};
const AsyncFunctionExtension = {

};
const GeneratorFunctionExtension = {

};
const GeneratorExtension = {
    [IsGeneratorSymbol]:true
};
const GeneratorTypeExtension = {
    isGenerator(gen){
        return (gen?.[IsGeneratorSymbol] === true);
    }
};
const PromiseTypeExtension = {
    newPromise(callBack){
        let res = null, rej = null;
        const n = new Promise((s,r)=>{res=s;rej=r;});
        callBack(res,rej,n);
        return n;
    }
}

const WorldExtension={
    overworld:world.getDimension(MinecraftDimensionTypes.overworld),
    nether:world.getDimension(MinecraftDimensionTypes.nether),
    theEnd:world.getDimension(MinecraftDimensionTypes.theEnd),
};
const EntityHealthComponentExtension = {
    get isDeath(){
        return this.current <= 0;
    },
    addCurrent(num){
        this.setCurrent(this.current + num);
    },
    getMaxHP(){
        const current = this.current;
        this.resetToMaxValue();
        const max = this.current;
        this.setCurrent(current);
        return max;
    }
};

Object.assign(Object.prototype,ObjectExtension);
Object.assign(Array.prototype,ArrayExtension);
Object.assign(Array,ArrayType);
Object.assign(String.prototype,StringExtension);
Object.assign(Number.prototype,NumberExtension);
Object.assign(Number,NumberTypeExtension);
Object.assign(Date.prototype,DateExtension);

Object.assign(Generator.prototype,GeneratorExtension);
Object.assign(Generator,GeneratorTypeExtension);
Object.assign(Function.prototype,FunctionExtension);
Object.assign(Function,FunctionTypeExtension);
Object.assign(Promise,PromiseTypeExtension);
Object.assign(AsyncFunction.prototype,AsyncFunctionExtension.assign(FunctionExtension));
Object.assign(GeneratorFunction.prototype,GeneratorFunctionExtension.assign(FunctionExtension));

Object.assign(World.prototype, WorldExtension);
Object.assign(EntityHealthComponent.prototype,EntityHealthComponentExtension);