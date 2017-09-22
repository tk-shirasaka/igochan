<login>
    <div if={you == undefined || !you.name} class='mdl-textfield mdl-js-textfield mdl-textfield--expandable'>
        <label class='mdl-button mdl-js-button mdl-button--icon' for='name'>
            <i class='material-icons'>account_circle</i>
        </label>
        <div class='mdl-textfield__expandable-holder'>
            <input id='name' class='mdl-textfield__input' type='text' onchange={onchange}>
        </div>
    </div>
    <div if={you != undefined && you.name} class='mdl-typography--title'>{you.name}</div>

    var self = this;

    this.websocket.on('receive:user', function(you) {
        if (self.you !== undefined && self.you.name && !you.name) self.websocket.trigger('send', {reconnect: self.you.name});
        self.you = you;
        self.update();
    });
    this.onchange = function(e) {
        self.websocket.trigger('send', {name: e.target.value});
    };
</login>
