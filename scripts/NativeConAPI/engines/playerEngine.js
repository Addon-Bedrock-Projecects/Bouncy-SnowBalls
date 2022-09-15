import {world} from 'mojang-minecraft';
import { Config as Con } from '../config.js';
import { PlayerEvent } from '../libraries/classes.js';
import { healths, onLinePlayers,containers,scores, screens } from './Server.js';

const deathSymbol = Symbol('Death'), SetModeSymbol = Symbol('setGamemode'), Config = Con.getConfig(), {events: {tick,playerImport,playerReady,playerDeath,playerRespawn,playerJoin,playerLeave}} = world;

playerImport.subscribe(function*({playerName,data,player}){
    if (Config.NativeOPplayers.includes(playerName)) data.op = Config.MaxPermition;
    while(player!=undefined){
        yield 1;
        try {
            const result = yield player.runCommandAsync('testfor @s');
            break;
        } catch (er) {}
    }
    onLinePlayers[playerName] = player;
    healths[playerName] = player.getComponent('minecraft:health');
    containers[playerName] = player.getComponent('minecraft:inventory').container;
    screens[playerName] = player.onScreenDisplay;
    scores[playerName] = player.scoreboard;
    if (player[SetModeSymbol]) player.runCommandAsync("gamemode " + Config.DefaultGamemode);
    playerReady.execute(new PlayerEvent(player));
});
tick.subscribe(()=>{
    for (const playerName of onLinePlayers) {
        const heards = healths[playerName], player = onLinePlayers[playerName];
        try {
            if (heards.current<=0&&!player[deathSymbol]) {
                player[deathSymbol] = true;
                playerDeath.execute(new PlayerEvent(player));
                continue;
            }
            if(heards.current>0&&player[deathSymbol]){
                player[deathSymbol] = false;
                playerRespawn.execute(new PlayerEvent(player));
            }
        } catch {

        }
    }
});
playerLeave.subscribe(({playerName})=>{
    delete onLinePlayers[playerName];
    delete healths[playerName];
    delete containers[playerName];
    delete screens[playerName];
});
playerJoin.playerInicialization = function plInit({player}){
    const data = Object.assign({op:Config.DefaultPermition,firstJoin:true},player.load());
    if (!data.firstJoin) {
        if (Config.AlwaySpawn && !player.data.noSpawn) {
            Config.DoSpawn?player.teleport(Config.SpawnPoint.toLocation(),Config.SpawnDimension,0,0):null;
        }
    } else {
        player[SetModeSymbol] = Config.UseDefaultGamemode;
        Config.DoSpawn?player.teleport(Config.SpawnPoint.toLocation(),Config.SpawnDimension,0,0):null;
    }
    playerImport.execute(new PlayerEvent(player));
    player.save();
}
playerJoin.subscribe(playerJoin.playerInicialization);