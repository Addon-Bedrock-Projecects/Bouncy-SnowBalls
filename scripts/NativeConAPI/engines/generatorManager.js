import {Events, world} from 'mojang-minecraft';
import CONFIG from "../config.js";
import { GreenAPIValidYieldSymbol, GreenAPIYieldDataTypeSymbol,GeneratorIsRunningSymbol, IsNotNativeEvent } from '../Symbols.js';
import { YieldCommandTypes, YieldDataTypes } from "../libraries/classes.js";
const ArgumentSymbol = Symbol('Arguments');
const GenPromiseSymbol = Symbol('pro');

const {events} = world;
class GreenEngine{
    constructor(){
        this.tickTime = 0;
        this.maxTickTime = CONFIG.tickSpeed;
        this.yields = [];
        events.tick.subscribe(n=>this._tick(n));
    }
    _tick(){
        this.tickTime = new Date().getTime();
        while (this.yields.length>0) {
            this._step(...this.yields.shift());
        }
    }
    _runGen(iterator){
        if (iterator[GeneratorIsRunningSymbol] === true) return iterator[GenPromiseSymbol];
        return Promise.newPromise((res,rej,pro)=>{
            iterator[GeneratorIsRunningSymbol] = true;
            iterator[GenPromiseSymbol] = pro;
            this._step(iterator,res,rej,pro);
        });
    }
    _step(iterator,resolve,reject,promise){
        if(iterator[GeneratorIsRunningSymbol]!==true) reject(new Error('Generator is not running!'));
        try {
            const {value,done} = iterator.next(iterator[ArgumentSymbol]);
            delete iterator[ArgumentSymbol];
            if(done) {resolve(value);return;};
            if (value==null || value === 0) {
                if(Date.now() - this.tickTime < CONFIG.tickSpeed)this.yields.push([iterator,resolve,reject,promise])
                else setTimeout(()=>this.yields.push([iterator,resolve,reject,promise]),1);
            } else if (value[GreenAPIValidYieldSymbol]){
                if(typeof(value) === 'number') setTimeout(()=>this.yields.push([iterator,resolve,reject,promise]),value);
                else{
                    this._runType(iterator,resolve,reject,promise,value);
                }
            } else if('then' in value) {
                value.then(rese=>{iterator[ArgumentSymbol] = rese;this._step(iterator,resolve,reject,promise);},reje=>{this._throw(iterator,resolve,reject,promise,reje);});
            }else{
                this._throw(...arguments,new TypeError('Invalid type passed in to the yield: ' + value));
            }
        } catch (er) {
            reject(er);
        }
    }
    _runType(iterator,res,rej,pro,value){
        switch (value[GreenAPIYieldDataTypeSymbol]) {
            case YieldDataTypes.command:
                this._command(...arguments);
                break;
            case YieldDataTypes.event:
                const ev = value.subscribe(n=>{
                    iterator[ArgumentSymbol] = n;
                    this._step(iterator,res,rej,pro);
                    value.unsubscribe(ev);
                });
                break;
            case YieldDataTypes.generator:
                if (value[GeneratorIsRunningSymbol] === true) value[GenPromiseSymbol].then(rese=>{iterator[ArgumentSymbol] = rese;this._step(iterator,res,rej,pro);},reje=>{this._throw(iterator,res,rej,pro,reje);});
                else{
                    value[GeneratorIsRunningSymbol] = true;
                    value[GenPromiseSymbol] = pro;
                    this._step(value,rese=>{iterator[ArgumentSymbol] = rese;this._step(iterator,res,rej,pro);},reje=>{this._throw(iterator,res,rej,pro,reje);},pro);
                }
                break;
            case YieldDataTypes.promise:
                value.then(rese=>{iterator[ArgumentSymbol] = rese;this._step(iterator,res,rej,pro);},reje=>{this._throw(iterator,res,rej,pro,reje);});
                break;
            default:
                this._throw(iterator,res,rej,pro,new TypeError('Not supported type passed in to the yield.'));
                break;
        }
    }
    _command(iterator,res,rej,pro,value){
        switch (value.command) {
            case YieldCommandTypes.thisGenerator:
                iterator[ArgumentSymbol] = iterator;
                this._step(iterator,res,rej,pro);
                break;
            case YieldCommandTypes.thisPromise:
                iterator[ArgumentSymbol] = pro;
                this._step(iterator,res,rej,pro);
                break;
            default:
                this._throw(iterator,res,rej,pro, new TypeError('Unknow command passed in to the yield.'));
                break;
        }
    }
    _throw(iterator,res,rej,pro,er){
        try{
            iterator.throw(er);
            this.yields.push([iterator,res,rej,pro]);
            return true;
        } catch(error){
            rej(error);
            return false;
        }
    }
}
const greenGlobal = new GreenEngine();
const TheGeneratorPrototype = {
    [GeneratorIsRunningSymbol]: false,
    [GreenAPIValidYieldSymbol]: true,
    [GreenAPIYieldDataTypeSymbol]: YieldDataTypes.generator,
    then(){
        return greenGlobal._runGen(this).then(...arguments);
    }
}
Object.assign(Generator,{
    runAsync(){
        if (this instanceof GeneratorFunction) return greenGlobal._runGen(this(...arguments));
        else if (Generator.isGenerator(this)) return greenGlobal._runGen(this);
        else throw new TypeError('argument [0] s not a generator.');
    }
});
Object.assign(Generator.prototype,TheGeneratorPrototype);
Object.assign(Promise.prototype,{[GreenAPIValidYieldSymbol]:true,[GreenAPIYieldDataTypeSymbol]: YieldDataTypes.promise});
Object.assign(Number.prototype,{[GreenAPIValidYieldSymbol]:true});

const EventPrototype = {[GreenAPIValidYieldSymbol]: true,[GreenAPIYieldDataTypeSymbol]: YieldDataTypes.event,
    then(res,rej){
        const unsub = this.subscribe((params)=>{
            this.unsubscribe(unsub);
            if(params[IsNotNativeEvent]) return res(params);
            print('is Native');
            const e = {};
            const protype = Object.getPrototypeOf(params);
            for (const k of Object.keys(protype)) {
                print('key: ' + (typeof(k)!=='symbol')?k:'[symbol: Symbol]');
                e[k] = params[k];
            }
            res(e);
        });
    }
};
for (const key of Object.keys(Events.prototype)) {
    Object.assign( Object.getPrototypeOf(events[key]),EventPrototype);
}