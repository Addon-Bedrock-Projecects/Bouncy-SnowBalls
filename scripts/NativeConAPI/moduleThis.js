const Generator = Object.getPrototypeOf(function*(){});
const AsyncGenerator = Object.getPrototypeOf(async function*(){});
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
export const ConsoleSymbol = Symbol('console');
export default ConsoleSymbol;

Object.assign(globalThis,{
    Generator:Generator,
    GeneratorFunction: Generator.constructor,
    AsyncGenerator:AsyncGenerator,
    AsyncGeneratorFunction:AsyncGenerator.constructor,
    AsyncFunction:AsyncFunction,
    [ConsoleSymbol]:console,
    console:{
        warn(){ globalThis[ConsoleSymbol].warn('[§gWarn§r]: §f',...arguments); },
        log(){ globalThis[ConsoleSymbol].warn('[§bLog§r]: §7',...arguments); },
        error(){ globalThis[ConsoleSymbol].error('[§cError§r]: §g',...arguments); },
        success(){globalThis[ConsoleSymbol].error('[§2Success§r]: §g',...arguments); }
    },
    print(){return console.log(...arguments);}
});