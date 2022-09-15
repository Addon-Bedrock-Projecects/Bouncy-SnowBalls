import { world } from "mojang-minecraft";
class Interval
{
    constructor(func,interval)
    {
        this.func = func;
        this.interval = interval;
    }
    _run()
    {
        toDo.setTimeout(()=>this._run(),this.interval,this.Token);
        this.func();
    }
    Start(){
        this.Token = toDo.setTimeout(()=>this._run(),this.interval);
        return this.Token;
    }
}
export class ToDo {
    constructor()
    {
        this.thisTick = 0;
        this.timeouts = {};
        this.cancelTokens = {};
    }
    onTick()
    {
        try {
            this.thisTick++;
            const n = this.timeouts[this.thisTick];
            if (n!=undefined) {
                delete this.timeouts[this.thisTick];
                Object.getOwnPropertySymbols(n).forEach(s=>{
                    try {
                        delete this.cancelTokens[s];
                        Function.runAsAsync.call(n[s]);
                    } catch (error) {
                        console.error(error,error.stack);
                    }
                });
            }
        } catch (error) {
            console.error(error,error.stack);
        }
    }
    setTimeout(callBack,timeout,Token)
    {
        if (parseInt(timeout)>0) {
            const id = timeout + this.thisTick;
            if (this.timeouts[id]==undefined) {
                this.timeouts[id] = {};
            }
            Token = Token??Symbol('timeoutID');
            this.timeouts[id][Token] = callBack;
            this.cancelTokens[Token] = id;
            return Token;
        }
        console.error('timeout number cant be null');
        return false;
    }
    clearTimeout(tokenSymbol){
        if (this.cancelTokens[tokenSymbol]!=undefined) {
            const id = this.cancelTokens[tokenSymbol];
            delete this.cancelTokens[tokenSymbol];
            if (this.timeouts[id]!=undefined) {
                delete this.timeouts[id][tokenSymbol];
                return true;
            }
        }
        return false;
    }
    setInterval(callBack,timeout){
        timeout=parseInt(timeout);
        if (timeout<=0) {
            throw new Error('Timeout cant be zero or negative.')
        }
        return (new Interval(callBack,timeout)).Start();
    }
    clearInterval(token){
        return this.clearTimeout(token);
    }
    waitFor(loop){
        return new Promise(res=>{
            const clearIn = this.setInterval(()=>{
                if(loop()){
                    this.clearInterval(clearIn);
                    res();
                }
            },3);
        });
    }
    static setTimeout(callBack,waitInTicks){
        return toDo.setTimeout(callBack,waitInTicks);
    }
    static clearTimeout(token){
        return toDo.clearTimeout(token);
    }
    static setInterval(callBack,waitInTicks){
        return toDo.setInterval(callBack,waitInTicks);
    }
    static clearInterval(token){
        return toDo.clearTimeout(token);
    }
    static waitFor(condition){
        if (typeof(condition) == 'object') {
           return toDo.waitFor(() => {return condition.value;});
        }
        else if (typeof(condition) == 'function'){
           return toDo.waitFor(condition);
        }
        return Promise.resolve();
    }
    static get currentTick(){
        return toDo.thisTick;
    }
}
let toDo = new ToDo();
world.events.tick.subscribe(()=>toDo.onTick());
Object.assign(globalThis,{
    setTimeout:(...params)=>toDo.setTimeout(...params),
    setInterval:(...params)=>toDo.setInterval(...params),
    clearTimeout:(...params)=>toDo.clearTimeout(...params),
    clearInterval:(...params)=>toDo.clearInterval(...params),
    setCountDown(callBack,callBack2,num,num2,...params){
        const canToken = setInterval(()=>{
            if (num2--<=0) {
                clearInterval(canToken);
                callBack2(...params);
            }else{
                callBack(...params);
            }
        },num);
        return canToken;
    },
    clearCountDown:(token)=>clearInterval(token),
    delay:(ticks)=> new Promise(res=>setTimeout(res,ticks))
});