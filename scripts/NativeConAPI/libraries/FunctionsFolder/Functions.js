export function Random(max) {
    return (Math.random() * max).fTrunc();
}
export function RandomBetween(max, min) {
    return Math.random() * (max - min) + min;
}
export function closeChat(player){
    player.run(["gamemode 0 @s[m=1]","damage @s 0 entity_attack"])[0].hasError?null:player.run("gamemode 1 @s");
}
export function fTrunc(number){
    return ~~number;
}
export function ToBlockPermutation(BlockType,blockData) {
    blockData=Math.trunc(blockData);
    let Permutaion = BlockType.createDefaultBlockPermutation();
    let array = Permutaion.getAllProperties();
    array.forEach((BlockProperty)=>{
        let BCount = BitsCount(BlockProperty.validValues.length-1);
        BlockProperty.value = BlockProperty.validValues[blockData&(0xffffffff>>>(32-BCount))];
        console.warn("BlockData: " + blockData.toString(2) + " BCount: " + BCount +" index: " + (blockData&(0xffffffff>>>(32-BCount))) + "  Digits: " + (0xffffffff>>>(32-BCount)).toString(2) + "  Length: " + BlockProperty.validValues.length +  "    " + BlockProperty.name + ": " + BlockProperty.value);
        blockData=blockData>>>BCount;
    });
    return Permutaion;
}
function BitsCount(number)
{
    let out = 1;
    for (let i = 1; 2**i <= number&i<=64; i++) {
        out = i + 1;
    }
    return out;
}

export function stringify(startObject,space=undefined,hasUnsafe=false) {
    let unsafeProperty = Symbol('unsafeproperty.fixed');
    function getString(ThisObject,before,isSpace)
    {
        switch (typeof ThisObject) {
            case 'function':
                return `function ${ThisObject.name??''}(${ThisObject.length} args)`;
            case 'object':
                if (ThisObject == null) {
                    return 'null';
                }
                if (!Object.entries(ThisObject).length) {
                    return '{}';
                }
                if (!ThisObject[unsafeProperty]) {
                    let isArray = Array.isArray(ThisObject);
                    let ReturnString = isArray?'[':'{';
                    let First = false;
                    let nextS = before + '' + (space??'');
                    hasUnsafe?ThisObject[unsafeProperty] = true:null;
                    try {
                        for (const key in ThisObject) {
                            if(key == unsafeProperty){continue;}
                            try {
                                ReturnString += (First?',':'') + ''+ (isSpace?'\n':'') + nextS + (isArray?'':`"${key}":${(isSpace?' ':'')}`) + getString(ThisObject[key],nextS,isSpace);
                            } catch (error) {
                                
                            }
                            First=true;
                        }
                    } catch {
                        
                    }
                    delete ThisObject[unsafeProperty];
                    return ReturnString + '' + ((space??false)?"\n" + before:'') + (isArray?']':'}');
                } else {
                    return '{...}';
                }
            default:
                return JSON.stringify(ThisObject);
        }
    }
    return getString(startObject,'',(space??''!=''));
}
export function stringifyEx(startObject,space=undefined,hasUnsafe=false) {
    let unsafeProperty = 'unsafeproperty.fixed';
    function getString(ThisObject,before,isSpace)
    {
        switch (typeof ThisObject) {
            case 'function':
                if (ThisObject.name === '') {
                    return `§gfunction ()§7`;
                }
                else{
                    return `§8constructor §3${ThisObject.name}§8()§7`;
                }
            case 'object':
                if (ThisObject == null|ThisObject==undefined) {
                    return 'null';
                }
                if (!ThisObject[unsafeProperty]) {
                    let isArray = Array.isArray(ThisObject);
                    let ReturnString = isArray?'[':'{';
                    let First = false;
                    let nextS = before + '' + (space??'');
                    hasUnsafe?ThisObject[unsafeProperty] = true:null;
                    try {
                        for (const key in ThisObject) {
                            if(key == unsafeProperty){continue;}
                            try {
                                ReturnString += (First?',':'') + ''+ (isSpace?'\n':'') + nextS + (isArray?'':`"${key}":${(isSpace?' ':'')}`) + getString(ThisObject[key],nextS,isSpace);
                            } catch (error) {
                                
                            }
                            First=true;
                        }
                    } catch {
                        
                    }
                    delete ThisObject[unsafeProperty];
                    return ReturnString + '' + ((space??false)?"\n" + before:'') + (isArray?']':'}');
                } else {
                    return '{...}';
                }
            default:
                return JSON.stringify(ThisObject);
        }
    }
    return '§7' + getString(startObject,'',(space??''!='')) + '§r';
}