import * as MC from 'mojang-minecraft';
const {overworld} = MC.world;

export class Config {
    AlwaySpawn = false;
    DoSpawn = false;
    NativeOPplayers = [];
    SpawnPoint = {x:0,y:0,z:0};
    SpawnDimension = overworld
    DefaultGamemode = 'survival';
    UseDefaultGamemode = false;
    DefaultPermition = 0;
    MaxPermition = 10;
    tickSpeed = 15;
    getCon(){
        return this;
    }
    static getConfig(){
        return CONFIG.getCon();
    }
}
const CONFIG = new Config();
export default CONFIG;