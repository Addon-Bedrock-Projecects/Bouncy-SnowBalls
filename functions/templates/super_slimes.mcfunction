scoreboard players set "minecraft:slime" blockMultiplier 175
function private/currentInfo
tellraw @s {"rawtext":[{"text":"§2Rebound power of slime: §a"},{"score":{"name":"minecraft:slime","objective":"blockMultiplier"}},{"text":"%"}]}