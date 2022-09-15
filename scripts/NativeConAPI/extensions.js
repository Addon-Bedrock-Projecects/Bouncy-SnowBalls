import * as MC from 'mojang-minecraft';
import './nativeExtensions.js';
import Config from './config.js';
import { PlayerEvent } from './libraries/classes.js';
const tagDataPrefix = '\x01,"¨_';
const {overworld} = MC.world;


const EntityExtension = {
    getBlockFromRay(){return this.getBlockFromViewVector(ViewVectorDistance);},
    blockLocation(){return this.location.toBlockLocation();},
    uuid(){return this.scoreboard.id;},
    run(commands){
        if (Array.isArray(commands) && typeof(commands) != 'string') {
            return commands.map((cmd)=>{
                return this.run(cmd);
            })
        }
        else{
            let output = {hasError:false,error:null};
            try {
                output.assign(this.runCommand(commands));
            } catch (error) {
                output.hasError = true;
                output.error = error;
            }
            return output;
        }
    },
    async runAsync(commands){
        if (Array.isArray(commands)) {
            const promises = [];
            for (let index = 0; index < commands.length; index++) {
                promises.push(this.runAsync(commands[index]));
            }
            return Promise.all(promises);
        }
        else {
            await 0;
            return this.run(commands);
        }
    },
    getTag(startsWith){for (let index = 0, Tags = this.getTags(); index < Tags.length; index++) if (Tags[index].startsWith(startsWith))return Tags[index];},
    removeAllTags(){for (let index = 0, Tags = this.getTags(); index < Tags.length; index++) this.removeTag(Tags[index]);},
    getContainer(){return this.getComponent('minecraft:inventory').container;},
    countOfItems(id){return this.getItemTable()[id];},
    getItemTable(){
        const container = this.getContainer();
        const Table = {};
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if(item===undefined){
                continue;
            }
            Table[item.id] = (Table[item.id]??0) + item.amount;
        }
        return Table;
    },
    clearItem(id,amout){
        const container = this.getContainer();
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (id === item?.id) {
                if(amout<item.amount){
                    item.amount -= amout;
                    amout = 0;
                    container.setItem(i,item);
                    break;
                } else {
                    amout -= item.amount;
                    container.setItem(i,MC.ItemStack.air);
                }
            }
        }
    },
    isDeath(){return this.getComponent('minecraft:health').current<=0;}
};
const PlayerExtension = {
    handItem(){
        return this.getContainer().getItem(this.selectedSlot);
    },
    setHandItem(itemStack){
        return this.getContainer().setItem(this.selectedSlot,itemStack);
    },
    save(){
        let MaxLength = 1000;
        for (const tag of this.getTags()) if(tag.startsWith(tagDataPrefix)) this.removeTag(tag);
        const Base = JSON.stringify(this.data);
        for (let index = 1000, Min = 0; index<5100; index++, Min+= MaxLength) {
            const Current = Base.substring(Min,Min + MaxLength);
            if (Current == "") break;
            if (index > 5000) throw new Error("extensions.js player.save() data is too big");
            this.addTag(tagDataPrefix+index + Current);
        }
        return this.data;
    },
    load(){
        let sBuilder = "";
        for (const tag of this.getTags()) {
            if(!tag.startsWith(tagDataPrefix)) continue;
            sBuilder += tag.substring(tagDataPrefix.length + 4);
        }
        try {
            this.data = JSON.parse(sBuilder);
        } catch (error) {
            this.data = {};
        } finally {
            this.data = this.data??{};
            return this.data;
        }
    },
    setActionbar(text){
        this.onScreenDisplay.setActionBar(text);
    },
    setTitle(text){
        if(EngineVersion.IsNewer(Config.EngineVersion,EngineVersions['1.19.0'])){
            this.onScreenDisplay.setTitle(text);
        }
        else{
            this.run('titleraw @s title ' + JSON.stringify({rawtext:[{text:text}]}));
        }
    },
    hasPermission(op){
        return this.data.op>=op;
    },
    setPermission(op){
        const OP = this.data.op;
        this.data.op = op;
        this.save();
        try {
            MC.world.events.playerPermissionChange.execute(new PlayerEvent(this).assign({permition:op,lastPermition:OP}));
        } catch (error) {
            console.error(error,error.stack);
        }

    },
    getPermission(){
        return this.data.op;
    },
    waitForCameraMove(){
        const viewVector = this.viewVector;
        return new Promise(res=>{
            const clearIn = this.setInterval(()=>{
                if(!viewVector.equals(this.viewVector)){
                    this.clearInterval(clearIn);
                    res();
                }
            },3);
        });
    },
    *waitForCameraMoveGenerator(){
        const viewVector = this.viewVector;
        while(viewVector.equals(this.viewVector)){
            yield 1;
        }
    },
    async tell(text){
        return await this.runCommandAsync('tellraw @s ' + JSON.stringify({rawtext:[{text:text}]}));
    }
};
const DimensionExtension = {
    run(commands){
        if (Array.isArray(commands)) {
            return commands.map((cmd)=>{
                return this.run(cmd);
            });
        }
        else{
            let output = {hasError:false,error:null};
            try {
                output.assign(this.runCommand(commands));
            } catch (error) {
                output.hasError = true;
                output.error = error;
            }
            return output;
        }
    },
    async runAsync(commands){
        if (Array.isArray(commands)) {
            const promises = [];
            for (let index = 0; index < commands.length; index++) {
                promises.push(this.runAsync(commands[index]));
            }
            return Promise.all(promises);
        }
        else {
            return await this.runCommandAsync(commands);
        }
    },
    async runCommandAsync(t){
        await undefined;
        return this.runCommand(t);
    }
};
const LocationExtension = {
    toBlockLocation()
    {
        if (this instanceof MC.BlockLocation) {
            return this;
        }
        return new MC.BlockLocation(this.x.trunc(),this.y.trunc(),this.z.trunc());
    },
    toLocation()
    {
        return new MC.Location(this.x,this.y,this.z);
    },
    toVector(){
        return new MC.Vector(this.x,this.y,this.z).normalized();
    },
    getSize(loc2){
        loc2 = loc2.toBlockLocation();
        const {x,y,z} = this.toBlockLocation();
        return ((Math.abs(x - loc2.x)+1) * (Math.abs(y - loc2.y)+1) * (Math.abs(z - loc2.z)+1));
    },
    add(location,ay,az)
    {   
        if (ay==undefined) {
            location = (this instanceof MC.BlockLocation)?location.toBlockLocation():location;
            const {x,y,z} = {x:this.x+location.x,y:this.y+location.y,z:this.z+location.z};
            return (this instanceof MC.BlockLocation)?(new MC.BlockLocation(x,y,z)):(new MC.Location(x,y,z));
        }
        const {x,y,z} = this;
        return (this instanceof MC.BlockLocation)?(new MC.BlockLocation(x + location,y + ay,z + az)):(new MC.Location(x + location,y + ay,z + az));
    },
    toString(XYZ=false){
        if (XYZ) {
            return (this instanceof MC.BlockLocation)?(`x: ${this.x}  y: ${this.y}  z: ${this.z}`):(`x: ${this.x.toFixed(2)}  y: ${this.y.toFixed(2)}  z: ${this.z.toFixed(2)}`);
        } else{
            return `${this.x} ${this.y} ${this.z}`;
        }
    }
}
const ItemExtension = {
    hasLore(lore){
        const lores = this.getLore();
        return lore!=undefined?lores.includes(lore):lores.length>0;
    },
    addLore(lore){
        const Lores = this.getLore()??[];
        Lores.push(lore);
        this.setLore(Lores);
    },
    removeLore(lore){
        const Lores = this.getLore();
        for (let index = 0; index < Lores.length; index++) {
            if (Lores[index] == lore) {
                Lores.splice(index);
            }
        }
        this.setLore(Lores);
    },
    getEnchantments(){
        return this.getComponent('enchantments').enchantments;
    },
    setEnchantments(enchs){
        return this.getComponent('enchantments').enchantments = enchs;
    }
}
const ItemType={
    air:new MC.ItemStack(MC.Items.get('minecraft:air'))
};
const EnchantmentListExtension = {
    getLevels(){
        let level = 0;
        for (const Enchantment of this) {
            level+=Enchantment.level;
        }
        return level;
    }
};
const ScoreboardExtension = {};
const ScoreboardObjectiveExtension = {
    resetScoreTarget(identity){try {overworld.runCommand(`scoreboard players reset "${identity.displayName}" "${this.id}"`);return true;}catch{return false;}},
    setScoreTarget(target,score=0){overworld.runCommand(`scoreboard players set "${target.setModify()}" "${this.id.setModify()}" ${score}`);}
};
const ScoreboardIdentityExtension = {
    getScore(objective){
        try {
            if (objective instanceof MC.ScoreboardObjective) {
                return objective.getScore(this);
            } else if (typeof(objective) === 'string') {
                return MC.world.scoreboard.getObjective(objective).getScore(this);
            }
        } catch (error) {
            return null;
        }
    },
    async setScore(objective, number = 0){
        try {
            const obId = (objective instanceof MC.ScoreboardObjective)?objective.id:objective;
            if (this.type !== MC.ScoreboardIdentityType.fakePlayer) {
                return await this.getEntity().runCommandAsync(`scoreboard players set @s "${JSON.stringify(obId)}" ${number}`);
            } else if (typeof(objective) === 'string') {
                return await overworld.runCommandAsync(`scoreboard players set "${JSON.stringify(this.displayName)}" "${JSON.stringify(obId)}" ${number}`);
            }
            return false;
        } catch (error) {
            console.error(error,er.stack);
            return false;
        }
    },
    async addScore(objective, number = 0){
        try {
            const obId = (objective instanceof MC.ScoreboardObjective)?objective.id:objective;
            if (this.type !== MC.ScoreboardIdentityType.fakePlayer) {
                return await this.getEntity().runCommandAsync(`scoreboard players add @s "${JSON.stringify(obId)}" ${number}`);
            } else if (typeof(objective) === 'string') {
                return await overworld.runCommandAsync(`scoreboard players add "${JSON.stringify(this.displayName)}" "${JSON.stringify(obId)}" ${number}`);
            }
            return false;
        } catch (error) {
            console.error(error,er.stack);
            return false;
        }
    },
    async resetScore(objective){
        try {
            const obId = (objective instanceof MC.ScoreboardObjective)?objective.id:objective;
            if (this.type !== MC.ScoreboardIdentityType.fakePlayer) {
                return await this.getEntity().runCommandAsync(`scoreboard players reset @s "${JSON.stringify(obId)}"`);
            } else if (typeof(objective) === 'string') {
                return await overworld.runCommandAsync(`scoreboard players reset "${JSON.stringify(this.displayName)}" "${JSON.stringify(obId)}"`);
            }
            return false;
        } catch (error) {
            console.error(error,er.stack);
            return false;
        }
    }
};

Object.assign(MC.Entity.prototype,EntityExtension);
Object.assign(MC.Player.prototype,Object.assign(PlayerExtension,EntityExtension));
Object.assign(MC.Dimension.prototype,DimensionExtension);

Object.assign(MC.Location.prototype,LocationExtension);
Object.assign(MC.BlockLocation.prototype,LocationExtension);
Object.assign(MC.Vector.prototype,LocationExtension);

Object.assign(MC.ItemStack.prototype,ItemExtension);
Object.assign(MC.ItemStack,ItemType);
Object.assign(MC.EnchantmentList.prototype,EnchantmentListExtension);


Object.assign(MC.Scoreboard.prototype,ScoreboardExtension);
Object.assign(MC.ScoreboardObjective.prototype,ScoreboardObjectiveExtension);
Object.assign(MC.ScoreboardIdentity.prototype,ScoreboardIdentityExtension);

const ViewVectorDistance = {includePassableBlocks:true,maxDisatnce:10};
