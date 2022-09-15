import { world, WorldInitializeEvent } from 'mojang-minecraft';
import { ParseArguments } from '../libraries/functions.js';
import { CommandBuilder,CustomCommandEvent, PlayerChatEvent, PlayerTerminal } from '../libraries/classes.js';
import { Config } from '../config.js';

export class Terminal{
    constructor(){
        this.commands = [];
        this.prefixes = [];
    }
    _REGISTRY(command){
        let comma = command;
        if(Array.isArray(comma)) return comma.forEach(n=>this._REGISTRY(n));
        if(!(comma instanceof CommandBuilder)) comma = new CommandBuilder(comma);
        this.prefixes.includes(comma._prefix)?null:this.prefixes.push(comma._prefix);
        this.commands.push(comma);
        return comma;
    }
    registryCommand(command){return this._REGISTRY(command);}
    static registryCommand(command){return terminal._REGISTRY(command);}
}
let terminal = new Terminal();
world.events.beforeChat.subscribe(eventData=>{
    const params = new CustomCommandEvent(eventData).setArguments(ParseArguments(eventData.message));
    const {commands} = terminal;
    for (const command of commands) {
        if(command.isCommand(params.arguments[0]) && command.canRunWith(eventData.sender)){
            switch (command.cancel) {
                case 1:
                    eventData.sendToTargets = true;
                    eventData.targets = [];
                    break;
                case 2:
                    eventData.cancel = true;
                    break;
                default:
                    break;
            }
            return Generator.runAsync.call(command.run(params.setCommand(command))).catch(er=>console.error(er,er.stack));
        }
    }
    /*if(Config.getConfig().chatRanks?.isEnabled){
        eventData.cancel = true;
        world.say(Config.getConfig()?.chatRanks?.execute(new PlayerChatEvent(eventData)));
    }*/
});
world.events.serverReady.subscribe(serverData=>{
    terminal.registryCommand([
        new CommandBuilder().setPrefix('-').setName('help').setAliases(['h','?']).setPermission(-1).setCancelation(1)
        .setInfo('Show list of aviable commands.').setSyntax('[showAliases: boolean]')
        .setExecutor((params)=>{
            let Output = '§a-----------------------------\n';
            let showAl = false;
            try { 
                showAl = JSON.parse((params.arguments[1]??'false').toLowerCase());
                terminal.commands.forEach((command)=>{
                    const cmd = command;
                    if (params.sender.hasPermission(cmd.permission)&!cmd.hidden) {
                        Output += `  §b${cmd.prefix}§a${cmd.name} §2${showAl?(`[${cmd.aliases.join(', ')}]`):''}: permition: ${cmd.permission}  ${cmd.syntax?'- ' + cmd.syntax:''}§8 ${cmd.info?'- ' + cmd.info:''}\n`;
                    }
                });
                Output += '§a-----------------------------'
                return Output;
            } catch (error) {
                return '§aIncorect sintax at "' + (params.arguments[1]??false) +'" . . .\n§8' + error;
            }
        })
    ]);
});
WorldInitializeEvent.prototype.registryCommand = function(){
    Terminal.registryCommand(...arguments);
}
world.events.playerImport.subscribe(({player})=>{
    new PlayerTerminal(player);
});