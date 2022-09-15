import { Events } from "mojang-minecraft";
import {EventForPrototype} from "../libraries/ClassesFolder/ConEvents.js";

for (const keyName of Object.keys(EventForPrototype)) {
    Events.prototype[keyName] = new EventForPrototype[keyName]();
}