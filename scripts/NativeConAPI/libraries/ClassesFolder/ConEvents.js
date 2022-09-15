import { world } from "mojang-minecraft";
import { IsNotNativeEvent } from "../../Symbols.js";
const ConEventMethodsSymbol = Symbol('ConEventMethods');
const SymbolForMethods = Symbol('MethodsSymbol');
const {overworld,nether,theEnd,scoreboard} = world;
export class ConEventSignal{
    constructor(){
        this[ConEventMethodsSymbol] = {};
    }
    subscribe(callBack){
        if (typeof(callBack) === 'function') {
            const ConEventSymbol = Symbol('ConEvent');
            callBack[SymbolForMethods] = ConEventSymbol;
            this[ConEventMethodsSymbol][ConEventSymbol] = callBack;
            return callBack;
        }
    }
    unsubscribe(callBack){
        if (callBack[SymbolForMethods] !== undefined) {
            delete this[ConEventMethodsSymbol][callBack[SymbolForMethods]];
            delete callBack[SymbolForMethods];
        }else{
            throw new Error(`Method not subscribed.`);
        }
    }
    execute(eventData){
        if (eventData instanceof ConEvent) {
            for (const MethodSymbols of Object.getOwnPropertySymbols(this[ConEventMethodsSymbol])) {
                const method = this[ConEventMethodsSymbol][MethodSymbols];

                if (method instanceof AsyncFunction) {
                    method(eventData).catch(r=>console.error(r,r.stack));
                }else if (method instanceof GeneratorFunction){
                    Generator.runAsync.call(method,eventData).catch(r=>console.error(r,r.stack));
                }else{
                    try {
                        method(eventData);
                    } catch (er) {
                        console.error(er,er.stack);
                    }
                }
            }
        } else {
            throw new TypeError('Argument is not type of ConEvent');
        }
    }
}
export class ConEvent{
    [IsNotNativeEvent] = true
};
export class PlayerEvent extends ConEvent {
    constructor(player){
        super();
        this.player = player;
        this.playerName = player?.name;
        this.dimension = player?.dimension??overworld;
        this.data = player?.data;
    }
    player = null;
    playerName = null;
    dimension = null;
    data = null;
}
export class PlayerChatEvent extends PlayerEvent{
    constructor(data){
        super(data.sender);
        for (const key of Object.keys(Object.getPrototypeOf(data))) {
            this[key] = data[key];
        }
    }
}
export class CustomCommandEvent extends PlayerChatEvent{
    constructor(data, command){
        super(data);
        this.command = command;
    }
    setArguments(array){
        this.arguments = array;
        return this;
    }
    setCommand(command){
        this.command = command;
        return this;
    }
    arguments = [];
    output = "";
}
export class ServerEvent extends ConEvent{
    constructor(server){
        super();
        this.cReg = server.cReg;
        this.eReg = server.eReg;
        this.propertyRegistry = server.pReg;
    }
    registryCommand(commands){
        return this.cReg(...arguments);
    }
    registryEvent(key,objects){
        return this.eReg(...arguments);
    }
    overworld = overworld;
    nether = nether;
    theEnd = theEnd;
    scoreboard = scoreboard;
}
export class PlayerDeathEventSignal extends ConEventSignal{constructor(){super();}};
export class PlayerRespawnEventSignal extends ConEventSignal{constructor(){super();}};
export class PlayerReadyEventSignal extends ConEventSignal{constructor(){super();}};
export class PlayerImportEventSignal extends ConEventSignal{constructor(){super();}};
export class PlayerPermissionChangeEventSignal extends ConEventSignal{constructor(){super();}};

export class ServerImportEventSignal extends ConEventSignal{constructor(){super();}};
export class ServerReadyEventSignal extends ConEventSignal{constructor(){super();}};

export const EventForPrototype = {
    playerDeath: PlayerDeathEventSignal,
    playerRespawn: PlayerRespawnEventSignal,
    playerImport: PlayerImportEventSignal,
    playerReady: PlayerReadyEventSignal,
    playerPermissionChange: PlayerPermissionChangeEventSignal,

    serverImport: ServerImportEventSignal,
    serverReady: ServerReadyEventSignal
}