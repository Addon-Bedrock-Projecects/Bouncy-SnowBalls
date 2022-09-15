import { world, MinecraftEntityTypes, Location, Vector, Direction, ScoreboardIdentityType} from "mojang-minecraft";
import { EventRegister, scoreboard } from './ConAPI';
const vectors = {
    [Direction.up]:"y",
    [Direction.down]:"y",
    [Direction.east]:'x',
    [Direction.west]:'x',
    [Direction.north]:'z',
    [Direction.south]:'z'
};
const locations = {
    [Direction.up]:new Location(0,0.1,0),
    [Direction.down]:new Location(0,-0.3,0),
    [Direction.east]:new Location(0.2,0,0),
    [Direction.west]:new Location(-0.2,0,0),
    [Direction.north]:new Location(0,0,-0.2),
    [Direction.south]:new Location(0,0,0.2),
};
let settings = {
    bouncy: new Map(),
    powerMultiplier: new Map(),
    blockMultiplier: new Map()
};
let obvNames = [
    'bouncy',
    'powerMultiplier',
    'blockMultiplier'
];
EventRegister.registry('Projectiles',{
    *serverImport(data){
        while(true){
            yield* loadScores();
            yield 75;
        }
    },
    projectileHit({blockHit,projectile,dimension,location}){
        if (blockHit!==undefined && projectile.times > 0) {
            let multiPly = blockHit.block.id==="minecraft:slime"?1.25:0.97;
            if(settings.blockMultiplier.has(blockHit.block.id)) multiPly = Number(settings.blockMultiplier.get(blockHit.block.id))/100;
            const newDirection = Vector.multiply(projectile.velocity,multiPly), spawnLocation = location.add(locations[blockHit.face]);
            newDirection[vectors[blockHit.face]] *= -1;

            const entity = dimension.spawnEntity(MinecraftEntityTypes.snowball.id,spawnLocation);
            entity.setVelocity(newDirection);
            entity.times = (projectile.times - 1);
        }
    },
    *beforeItemUse(n){
        const {item:{id}} = n;
        if (settings.bouncy.has(id)) {
            while (true) {
                const {entity} = yield world.events.entityCreate;
                if(entity.id === id) {
                    entity.times = Number(settings.bouncy.get(id));
                    if(settings.powerMultiplier.has(entity.id)){
                        yield;
                        entity.setVelocity(Vector.multiply(entity.velocity,(settings.powerMultiplier.get(entity.id))/100));
                    }
                    return;
                }
            }
        }
    }
});