# Bouncy-Snowballs
### How do they download this minecraft pack?
Just click on this link: *no ads also*
 - [Bouncy Snowballs v1.0.0.mcpack](https://github.com/Addon-Bedrock-Projecects/Bouncy-SnowBalls/releases/download/prerelease/Bouncy.SnowBalls-v1.0.0.mcpack)

### Setup tutorial:
When u creating your new world enable Gametest Framework Experiments! or your snowballs won't bounce.
IF you are not very good at commands then just copy this command and run it in your world, but if you need better experince then look at [Advanced Settings](https://github.com/Addon-Bedrock-Projecects/Bouncy-SnowBalls/edit/main/README.md#advanced-settings).
```mcfunction
/function templates/default
```
You may also notice stronger bounces when throwing at slime blocks, is that expected behavior? Yes!

### Advanced Settings
If you understand the commands better then you can define your own number of bounces of snowballs your self. Like:

```mcfunction
/scoreboard players set "minecraft:snowball" bouncy 10
```
Snowball will bounc 10 times.
You can also add a block to the list and determine its bounce power for the specific in percentages. e.g.
```mcfunction
/scoreboard players set "minecraft:bedrock" blockMultiplier 75
```
The above command will determine the bounce of the ball from the bedrock, the ball will bounce with 75% speed.
Also, if you want to decrease or increase the basic speed of throwing the ball, then use this command.
```mcfunction
/scoreboard players set "minecraft:snowball" powerMultiplier 150
```
After that, the speed of the ball will be 1.5x (150%) greater than the original vanilla
