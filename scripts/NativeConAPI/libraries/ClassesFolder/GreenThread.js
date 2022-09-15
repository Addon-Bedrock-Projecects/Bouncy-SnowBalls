import {GreenAPIValidYieldSymbol,GreenAPIYieldDataTypeSymbol} from '../../Symbols.js';
export const YieldDataTypes = {
    command:'command',
    event:'event',
    generator:'generator',
    promise:'promise',
    generatorData:'generatorData',
    promiseData:'promiseData',
    eventData:'eventData',
};
export const YieldCommandTypes = {
    thisGenerator: 'thisGen',
    thisPromise: 'thisPro'
};
export class YieldCommand{
    constructor(commandType){
        this.command = commandType;
    }
    [GreenAPIValidYieldSymbol] = true;
    [GreenAPIYieldDataTypeSymbol] = YieldDataTypes.command;
}
export const YieldCommands={
    thisGenerator: new YieldCommand(YieldCommandTypes.thisGenerator),
    thisPromise: new YieldCommand(YieldCommandTypes.thisPromise),
}
Object.freeze(YieldCommands);
Object.freeze(YieldCommandTypes);
Object.freeze(YieldDataTypes);