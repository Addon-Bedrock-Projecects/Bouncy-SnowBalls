const termSymbol = Symbol('Terminal Symbol');
export class CommandBuilder{
    constructor(data)
    {
        this.cancel = 2;
        this.prefix = '!';
        this.aliases = [];
        this.visibility = false;
        this.permission = 0;
        this.info = '';
        this.syntax = '';
        this.timeout = 0;
        this.execute = ()=>"§4No code was executed.";
        this.getParams = {};
        Object.assign(this,data);
        return this;
    }
    get _cancel(){return this.cancel;}
    get _name(){return this.name;}
    get _prefix(){return this.prefix;}
    get _aliases(){return this.aliases;}
    get _info(){return this.info;}
    get _syntax(){return this.syntax;}
    get _visibility(){return this.visibility;}
    get _permission(){return this.permission;}
    get _timeout(){return this.timeout;}
    get _executor(){return this.execute;}
    *run(params)
    {
        const term = params.sender[termSymbol];
        try {
            params.item = params.sender.handItem();
            params.output = "";
            params.output += (yield* Function.runAsGenerator(this._executor(params)))??'§2Command was successfuly run.';
            term.timeouts.set(this._name,Date.now());
        } catch (er) {
            params.output = "Unexcepted executor error: " + er;
            console.log('Command field to run successfuly: ', er, er.stack);
        }
        term.tell(params.output);
    }
    isCommand(firstOne){
        firstOne = firstOne.toLowerCase();
        if(!firstOne.startsWith(this._prefix)) return false;
        const sub = firstOne.substring(this._prefix.length);
        return ((this._name === sub) || this._aliases.includes(sub));
    }
    canRunWith(player){
        const {timeouts, op} = player[termSymbol];
        const {_name,_timeout,_permission} = this;
        timeouts.set(_name,timeouts.get(_name)??0);
        return (op>=_permission && (Date.now() - timeouts.get(_name)) > _timeout);
    }
    setCancelation(calcelationLevel){this.cancel = calcelationLevel; return this;}
    setPrefix(prefix){this.prefix = prefix;return this;}
    setName(name){this.name = name;return this;}
    setAliases(aliases){this.aliases = aliases;return this;}
    setPermission(permission){this.permission = permission;return this;}
    setInfo(info){this.info = info;return this;}
    setSyntax(syntax){this.syntax = syntax;return this;}
    setExecutor(callBack){this.execute = callBack;return this;}
    setTimeout(timeout){this.timeout = timeout;return this;}
    setVisibility(isVisible){this.visibility = isVisible;return this;}
}
export class PlayerTerminal{
    constructor(player){
        player[termSymbol] = this;
        this.player = player;
    }
    timeouts = new Map();
    get op(){return this.player.getPermission();}
    tell(text){return this.player.tell(text);}
}