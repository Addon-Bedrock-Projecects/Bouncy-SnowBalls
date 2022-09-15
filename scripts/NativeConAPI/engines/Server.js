import { world } from 'mojang-minecraft';
import config from '../config.js';
import { ParsePlayer} from '../libraries/functions.js';
import { CommandBuilder, PlayerEvent, ServerEvent, TheMap } from '../libraries/classes.js';

export class Server{
    onLinePlayers = new TheMap();
    containers = new TheMap();
    healths = new TheMap();
    screens = new TheMap();
    scores = new TheMap();
}

const serverEngine = new Server();
world.events.worldInitialize.subscribe(async (params)=>{
    const Args = new ServerEvent({
        cReg:command=>params.registryCommand(command),
        eReg:(key,value)=>params.registryEvent(key,value),
        pReg:params.propertyRegistry
    });
    await world.events.serverImport.execute(Args);
    await world.events.serverReady.execute(Args);
    for (const iterator of world.getPlayers()) {
        try {
            await world.events.playerJoin.playerInicialization({player:iterator});
        } catch (error) {
            console.warn(error,error.stack);
        }
    }
});
world.events.serverImport.subscribe(params=>{
    params.registryCommand([
        new CommandBuilder().setPrefix('-').setName('debug').setAliases(['d']).setPermission(1).setInfo('Turns off|on debug mode.')
        .setExecutor(function(params){
                let pl = params.sender;
                let Has = pl.hasTag('debug');
                Has?pl.removeTag('debug'):pl.addTag('debug');
                throw new Error('Hello');
                return '§8[§gDebug§8]§7: §r ' + (Has?'Off':'On');
        }),
        new CommandBuilder().setPrefix('-').setName('permission').setPermission(config.MaxPermition)
        .setExecutor(function(params){
                let Args2 = params.arguments[2];
                switch (params.arguments[1]?.toLowerCase()) {
                    case "set":
                        if (Args2 != undefined) {
                            console.warn('player: ' + ParsePlayer(Args2));
                            const Bro = serverEngine.onLinePlayers[ParsePlayer(Args2)];
                            if (Bro==undefined)
                                return "§4Player not found.";
                            const Args3 = params.arguments[3].toLowerCase();
                            if(Args3!="max"&Args3!="min"&Number.isNaN(Number(Args3)))
                                return "§4Invalid parameter";
                            switch (Args3) {
                                case "max":
                                    Bro.setPermission(config.MaxPermition);
                                    break;
                                case "min":
                                    Bro.setPermission(0);
                                    break;
                                default:
                                    Bro.setPermission(Number(Args3));
                                    break;
                            }
                            return `§2${Bro.name} now have level op: §7${Bro.getPermission()}`;
                        }
                        break;
                    case "show":
                        if (Args2 != undefined) {
                            if(Args2 == "*"){
                                let Ret = "§2Permissions of Players§7";
                                serverEngine.onLinePlayers.forEach((player,playerName) => {
                                    Ret += `\n - ${playerName}: ${player.getPermission()}`;
                                });
                                return Ret;
                            }
                            else {
                                const Bro = serverEngine.onLinePlayers[ParsePlayer(Args2)];
                                if (Bro!=undefined)
                                    return `§2${Bro.name}§8: §7 ${Bro.getPermission()}`;
                                return "§4Player not found.";
                            }
                        }
                        return '§4Invalid argument' + " >><<\nallowed values: *, [playername]";
                    default:
                        return '§4Invalid argument' + " >>" + params.arguments[1] + "<<\nallowed values: show, set";
                }
            })
    ]);
});
const {onLinePlayers,healths,containers,screens,scores} = serverEngine;
export {onLinePlayers,healths,containers,screens,scores, serverEngine as server};
export default serverEngine;