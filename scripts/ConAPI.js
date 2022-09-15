export * from './NativeConAPI/moduleThis.js';
import './NativeConAPI/nativeExtensions.js';
import './NativeConAPI/extensions.js';
import './NativeConAPI/inicialization/import.js';
import './NativeConAPI/engines/generatorManager.js';
import './NativeConAPI/engines/playerEngine.js';
import { MinecraftDimensionTypes, world } from 'mojang-minecraft';

export {default as global} from "./NativeConAPI/global.js";
export {default as Config} from './NativeConAPI/config.js';
export {EventRegister} from "./NativeConAPI/engines/eventManager.js";
export  {Database, ExtendedDatabase} from "./NativeConAPI/engines/Database.js";
export {server as Server,onLinePlayers,healths,containers,screens,scores} from "./NativeConAPI/engines/Server.js";

export {Terminal} from "./NativeConAPI/engines/Terminal.js";
export {ToDo} from "./NativeConAPI/engines/ToDo.js";

export * from './NativeConAPI/libraries/functions.js';
export * from './NativeConAPI/libraries/classes.js';
export * from './NativeConAPI/libraries/Shapes.js';

export { ControlTypes, FormTypes , FormClasses , FormOutputTypes, FormBuilder} from './NativeConAPI/engines/UIBuilder.js';
export {code,decode} from './NativeConAPI/referenies/NBT.js';
const {overworld,nether,theEnd, events, scoreboard} = world;
export {overworld,nether,theEnd, theEnd as the_end, events, world , scoreboard};
export const dimensions = {[MinecraftDimensionTypes.overworld]: overworld,[MinecraftDimensionTypes.nether]: nether,[MinecraftDimensionTypes.theEnd]: theEnd};

export * as MC from 'mojang-minecraft';
export * as UI from 'mojang-minecraft-ui';