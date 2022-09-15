import * as MC from 'mojang-minecraft';

const SphereShape = 'Sphere';
const SphereExShape = 'SphereEx';
const LineShape = 'Line3D';
const AreaShape = 'Area';
const WallShape = 'Wall';
const FillShape = 'Fill';
const BlockShape = 'Block';
const CylinderShape = 'Cylinder';

export class Shapes{
    static SphereShape = SphereShape;
    static SphereExShape = SphereExShape;
    static LineShape = LineShape;
    static AreaShape = AreaShape;
    static WallShape = WallShape;
    static FillShape = FillShape;
    static BlockShape = BlockShape;
    static CylinderShape = CylinderShape;
}
export class ShapeGenerator{
    static [CylinderShape] = function*(Radius,contructor = MC.Location){
        let x=0 , z = 0;
        let RadiusMin = 0;
        let Radius2 = Radius*Radius;
        let RadiusMin2=RadiusMin*RadiusMin;
        for (let Y = -Radius; Y  < Radius; Y++) {
            for (let X = x-Radius; X < x+Radius; X++) {
                let XX = (X-x)*(X-x);
                if (XX<Radius2) {
                    for (let Z = z-Radius; Z < z+Radius; Z++) {
                        let ZZ = XX + (Z-z)*(Z-z);
                        if (ZZ<Radius2) {
                            if (ZZ>=RadiusMin2|XX>=RadiusMin2) {
                                try {
                                    yield (new contructor(X,Y,Z));
                                } catch (error) { 
                                    return error; 
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    static [SphereShape] = function*(Radius){
        let x=0 , y=0 , z = 0;
        let RadiusMin = 0;
        let Radius2 = Radius*Radius;
        let RadiusMin2=RadiusMin*RadiusMin;
        for (let X = x-Radius; X < x+Radius; X++) {
            let XX = (X-x)*(X-x);
            if (XX<Radius2) {
                for (let Y = y-Radius; Y < y+Radius; Y++) {
                    let YY = XX + (Y-y)*(Y-y);
                    if (YY<Radius2) {
                        for (let Z = z-Radius; Z < z+Radius; Z++) {
                            let ZZ = YY + (Z-z)*(Z-z);
                            if (ZZ<Radius2) {
                                if (ZZ>=RadiusMin2|YY>=RadiusMin2|XX>=RadiusMin2) {
                                    try {
                                        yield (new MC.Location(X,Y,Z));
                                    } catch (error) { 
                                        return error; 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    static [SphereExShape] = function*(Data) {
        let {thickness,radiusX,radiusY,radiusZ,radius} = Data;
        thickness = thickness??0;
        if (typeof(radius) == 'object') {
            radiusX = radius.x;
            radiusY = radius.y;
            radiusZ = radius.z;
        }
        else {
            radiusX=radiusX??radius;
            radiusY=radiusY??radius;
            radiusZ=radiusZ??radius;
        }
        let RX2=radiusX**2,RY2=radiusY**2,RZ2=radiusZ**2;
        let RX2Min=thickness>0?(radiusX-thickness)**2:0,RY2Min=thickness>0?(radiusY-thickness)**2:0,RZ2Min=thickness>0?(radiusZ-thickness)**2:0;
        print(RX2,RY2,RZ2,RX2Min,RY2Min,RZ2Min);
        for (let X = -radiusX; X < radiusX; X++) {
            let XX = X**2;
            if (XX<RX2) {
                for (let Y = -radiusY; Y < radiusY; Y++) {
                    let YY = XX*(radiusY/radiusX) + Y**2; //XX*(radiusY/radiusX)
                    if (YY<RY2) {
                        for (let Z = -radiusZ; Z < radiusZ; Z++) {
                            let ZZ = YY*(radiusZ/radiusY) + Z**2; //YY*(radiusZ/radiusY)
                            if (ZZ<RZ2) {
                                if (ZZ>=RZ2Min|YY>=RY2Min|XX>=RX2Min) {
                                    const Stop = yield new MC.Location(X,Y,Z);
                                    if (Stop) {
                                        //return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    static [LineShape] = function*(loc1,loc2){
        if((yield new MC.Location(loc1.x,loc1.y,loc1.z))??false){
            return;
        }
        let xs ,ys ,zs = 0;
        let x1 = loc1.x, y1=loc1.y, z1=loc1.z;
        let x2 = loc2.x, y2=loc2.y, z2=loc2.z;
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let dz = Math.abs(z2 - z1);
        (loc2.x>loc1.x)?xs = 1 : xs = -1;
        (loc2.y>loc1.y)?ys = 1 : ys = -1;
        (loc2.z>loc1.z)?zs = 1 : zs = -1;
        let p1 = 0, p2 = 0;
        if (dx >= dy & dx >= dz)
        {
            p1 = 2 * dy - dx;
            p2 = 2 * dz - dx;
            while ( x1.fTrunc() !=  x2.fTrunc())
            {
                x1 += xs;
                if (p1 >= 0)
                {
                    y1 += ys;
                    p1 -= 2 * dx;
                }
                if (p2 >= 0)
                {
                    z1 += zs;
                    p2 -= 2 * dx;
                }
                p1 += 2 * dy;
                p2 += 2 * dz;
                if((yield new MC.Location(x1,y1,z1))??false){
                    return;
                }
            }
        } else if (dy >= dx & dy >= dz)
        {
            p1 = 2 * dx - dy;
            p2 = 2 * dz - dy;
            while ( y1.fTrunc() !=  y2.fTrunc())
            {
                y1 += ys;
                if (p1 >= 0)
                {
                    x1 += xs;
                    p1 -= 2 * dy;
                }
                if (p2 >= 0)
                {
                    z1 += zs;
                    p2 -= 2 * dy;
                }
                p1 += 2 * dx;
                p2 += 2 * dz;
                if((yield new MC.Location(x1,y1,z1))??false){
                    return;
                }
            }
        } else {
            p1 = 2 * dy - dz;
            p2 = 2 * dx - dz;
            while ( z1.fTrunc() !=  z2.fTrunc())
            {
                z1 += zs;
                if (p1 >= 0)
                {
                    y1 += ys;
                    p1 -= 2 * dz;
                }
                if (p2 >= 0)
                {
                    x1 += xs;
                    p2 -= 2 * dz;
                }
                p1 += 2 * dy;
                p2 += 2 * dx;
                if((yield new MC.Location(x1,y1,z1))??false){
                    return;
                }
            }
        }
    }
    static [AreaShape] = function*(loc1,loc2){
        const Block = loc2.toBlockLocation();
        const {x2,y2,z2} = {x2:Block.x,y2:Block.y,z2:Block.z};
        const {x,y,z} = loc1.toBlockLocation();
        let {XMin,XMax} = {XMin:(x2>=x)?x:x2,XMax:(x2<x)?x:x2};
        let {YMin,YMax} = {YMin:(y2>=y)?y:y2,YMax:(y2<y)?y:y2};
        let {ZMin,ZMax} = {ZMin:(z2>=z)?z:z2,ZMax:(z2<z)?z:z2};
        for (let X = XMin; X  <= XMax; X++) {
            for (let Y = YMin; Y  <= YMax; Y++) {
                for (let Z = ZMin; Z  <= ZMax; Z++) {
                    if((yield new MC.Location(X,Y,Z))??false){
                        return;
                    }
                }
            }
        }
    }
    static [WallShape] = function*(loc1,loc2){
        const Block = loc2.toBlockLocation();
        const {x2,y2,z2} = {x2:Block.x,y2:Block.y,z2:Block.z};
        const {x,y,z} = loc1.toBlockLocation();
        let {XMin,XMax} = {XMin:(x2>=x)?x:x2,XMax:(x2<x)?x:x2};
        let {YMin,YMax} = {YMin:(y2>=y)?y:y2,YMax:(y2<y)?y:y2};
        let {ZMin,ZMax} = {ZMin:(z2>=z)?z:z2,ZMax:(z2<z)?z:z2};
        for (let Y = YMin; Y  <= YMax; Y++) {
            for (let X = XMin; X  <= XMax; X++) {
                if((yield new MC.Location(X,Y,ZMin))??false){
                    return;
                }
                if((yield new MC.Location(X,Y,ZMax))??false){
                    return;
                }
            }
            for (let Z = ZMin; Z  <= ZMax; Z++) {
                if((yield new MC.Location(XMin,Y,Z))??false){
                    return;
                }
                if((yield new MC.Location(XMax,Y,Z))??false){
                    return;
                }
            }
        }
    }
    static [FillShape] = function*(Radius){
        let Array = [];
        const Blocks = {};
        Array.push({loc:new MC.BlockLocation(0,0,0),dp:0});
        while (Array.length>0) {
            let n = Array.shift();
            if(n.dp<Radius&!Blocks[`${n.loc.x}.${n.loc.y}.${n.loc.z}`]){
                const loc = n.loc;
                const dp = n.dp + 1;
                if((yield loc)??false)
                    return;
                Blocks[`${n.loc.x}.${n.loc.y}.${n.loc.z}`] = true;
                Array.push({loc:loc.add(1,0,0),dp:dp});
                Array.push({loc:loc.add(-1,0,0),dp:dp});
                Array.push({loc:loc.add(0,1,0),dp:dp});
                Array.push({loc:loc.add(0,-1,0,0),dp:dp});
                Array.push({loc:loc.add(0,0,1),dp:dp});
                Array.push({loc:loc.add(0,0,-1),dp:dp});
            }
        }
        return;
    }
    static [BlockShape] = function*(Radius) {
        const s = Radius - 1;
        yield * this[AreaShape].call(new MC.Location(s,s,s),new MC.Location(-s,-s,-s));
    }
}
export class ShapeCallBack{
    static [SphereShape] = function(Radius,callBack,endCallBack){
        let x=0 , y=0 , z = 0;
        let RadiusMin = 0;
        let Radius2 = Radius*Radius;
        let RadiusMin2=RadiusMin*RadiusMin;
        breakMain:{
            for (let X = x-Radius; X < x+Radius; X++) {
                let XX = (X-x)*(X-x);
                if (XX<Radius2) {
                    for (let Y = y-Radius; Y < y+Radius; Y++) {
                        let YY = XX + (Y-y)*(Y-y);
                        if (YY<Radius2) {
                            for (let Z = z-Radius; Z < z+Radius; Z++) {
                                let ZZ = YY + (Z-z)*(Z-z);
                                if (ZZ<Radius2) {
                                    if (ZZ>=RadiusMin2|YY>=RadiusMin2|XX>=RadiusMin2) {
                                        try {
                                            if(callBack?.call(new MC.Location(X,Y,Z))??false){
                                                break breakMain;
                                            }
                                        } catch (error) {
                                            break breakMain;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        (endCallBack??callBack)?.call();
    }
    static [SphereExShape] = function(EventData,callback){
        let {thickness,radiusX,radiusY,radiusZ,radius} = EventData;
        if (typeof(radius) == 'object') {
            radiusX = radius.x;
            radiusY = radius.y;
            radiusZ = radius.z;
        }
        radiusX=radiusX??radius;
        radiusY=radiusY??radius;
        radiusZ=radiusZ??radius;
        let RX2=radiusX**2,RY2=radiusY**2,RZ2=radiusZ**2;
        let RX2Min=thickness>0?(radiusX-thickness)**2:0,RY2Min=thickness>0?(radiusY-thickness)**2:0,RZ2Min=thickness>0?(radiusZ-thickness)**2:0;
        for (let X = -radiusX; X < radiusX; X++) {
            let XX = X**2;
            if (XX<RX2) {
                for (let Y = -radiusY; Y < radiusY; Y++) {
                    let YY = XX*(radiusY/radiusX) + Y**2;
                    if (YY<RY2) {
                        for (let Z = -radiusZ; Z < radiusZ; Z++) {
                            let ZZ = YY*(radiusZ/radiusY) + Z**2;
                            if (ZZ<RZ2) {
                                if (ZZ>=RZ2Min|YY>=RY2Min|XX>=RX2Min) {
                                    try {
                                        if(callback?.call({x:X,y:Y,z:Z},EventData)??false){
                                            return;
                                        }
                                    } catch { return; }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    static [LineShape] = function(loc1, loc2,callBack){
        if (callBack?.call(loc1)??false) {
            return;
        }
        let xs ,ys ,zs = 0;
        let {x1=x,y1=y,z1=z} = loc1;
        let {x2=x,y2=y,z2=z} = loc2;
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let dz = Math.abs(z2 - z1);
        (loc2.x>loc1.x)?xs = 1 : xs = -1;
        (loc2.y>loc1.y)?ys = 1 : ys = -1;
        (loc2.z>loc1.z)?zs = 1 : zs = -1;
        let p1 = 0, p2 = 0;
        if (dx >= dy & dx >= dz)
        {
            p1 = 2 * dy - dx;
            p2 = 2 * dz - dx;
            while ( x1.fTrunc() !=  x2.fTrunc())
            {
                x1 += xs;
                if (p1 >= 0)
                {
                    y1 += ys;
                    p1 -= 2 * dx;
                }
                if (p2 >= 0)
                {
                    z1 += zs;
                    p2 -= 2 * dx;
                }
                p1 += 2 * dy;
                p2 += 2 * dz;
                if(callBack?.call(new MC.Location(x1,y1,z1))??false){
                    return;
                }
            }
        } else if (dy >= dx & dy >= dz)
        {
            p1 = 2 * dx - dy;
            p2 = 2 * dz - dy;
            while ( y1.fTrunc() !=  y2.fTrunc())
            {
                y1 += ys;
                if (p1 >= 0)
                {
                    x1 += xs;
                    p1 -= 2 * dy;
                }
                if (p2 >= 0)
                {
                    z1 += zs;
                    p2 -= 2 * dy;
                }
                p1 += 2 * dx;
                p2 += 2 * dz;
                if(callBack?.call(new MC.Location(x1,y1,z1))??false){
                    return;
                }
            }
        } else {
            p1 = 2 * dy - dz;
            p2 = 2 * dx - dz;
            while ( z1.fTrunc() !=  z2.fTrunc())
            {
                z1 += zs;
                if (p1 >= 0)
                {
                    y1 += ys;
                    p1 -= 2 * dz;
                }
                if (p2 >= 0)
                {
                    x1 += xs;
                    p2 -= 2 * dz;
                }
                p1 += 2 * dy;
                p2 += 2 * dx;
                if(callBack?.call(new MC.Location(x1,y1,z1))??false){
                    return;
                }
            }
        }
    }
    static [AreaShape] = function(loc1,loc2,callBack){
        const Block = loc2.toBlockLocation();
        const {x2,y2,z2} = {x2:Block.x,y2:Block.y,z2:Block.z};
        const {x,y,z} = loc1.toBlockLocation();
        let {XMin,XMax} = {XMin:(x2>x)?x:x2,XMax:(x2<x)?x:x2};
        let {YMin,YMax} = {YMin:(y2>y)?y:y2,YMax:(y2<y)?y:y2};
        let {ZMin,ZMax} = {ZMin:(z2>z)?z:z2,ZMax:(z2<z)?z:z2};
        for (let X = XMin; X  < XMax; X++) {
            for (let Y = YMin; Y  < YMax; Y++) {
                for (let Z = ZMin; Z  < ZMax; Z++) {
                    if((callBack(new MC.Location(X,Y,Z)))??false){
                        return;
                    }
                }
            }
        }
    }
    static [WallShape] = function(loc1,loc2,callBack){
        const Block = loc2.toBlockLocation();
        const {x2,y2,z2} = {x2:Block.x,y2:Block.y,z2:Block.z};
        const {x,y,z} = loc1.toBlockLocation();
        let {XMin,XMax} = {XMin:(x2>=x)?x:x2,XMax:(x2<x)?x:x2};
        let {YMin,YMax} = {YMin:(y2>=y)?y:y2,YMax:(y2<y)?y:y2};
        let {ZMin,ZMax} = {ZMin:(z2>=z)?z:z2,ZMax:(z2<z)?z:z2};
        for (let Y = YMin; Y  <= YMax; Y++) {
            for (let X = XMin; X  <= XMax; X++) {
                if((callBack(new MC.Location(X,Y,ZMin)))??false){
                    return;
                }
                if((callBack(new MC.Location(X,Y,ZMax)))??false){
                    return;
                }
            }
            for (let Z = ZMin; Z  <= ZMax; Z++) {
                if((callBack(new MC.Location(XMin,Y,Z)))??false){
                    return;
                }
                if((callBack(new MC.Location(XMax,Y,Z)))??false){
                    return;
                }
            }
        }
    }
    static [FillShape] = function(Radius,callBack){
        let Array = [];
        const Blocks = {};
        Array.push({loc:new MC.BlockLocation(0,0,0),dp:0});
        while (Array.length>0) {
            let n = Array.shift();
            if(n.dp<Radius&!Blocks[`${n.loc.x}.${n.loc.y}.${n.loc.z}`]){
                const loc = n.loc;
                const dp = n.dp + 1;
                if(callBack(loc)??false)
                    return;
                Blocks[`${n.loc.x}.${n.loc.y}.${n.loc.z}`] = true;
                Array.push({loc:loc.add(1,0,0),dp:dp});
                Array.push({loc:loc.add(-1,0,0),dp:dp});
                Array.push({loc:loc.add(0,1,0),dp:dp});
                Array.push({loc:loc.add(0,-1,0,0),dp:dp});
                Array.push({loc:loc.add(0,0,1),dp:dp});
                Array.push({loc:loc.add(0,0,-1),dp:dp});
            }
        }
        return;
    }
    static [BlockShape] = function(Radius,callBack){
        const s = Radius - 1;
        return this[AreaShape](new MC.Location(s,s,s),new MC.Location(-s,-s,-s),callBack);
    }
}