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

    this.opts.websocket.on('receive', function(data) {
        self.you = data.you;
        self.update();
    });
    this.onchange = function(e) {
        opts.websocket.trigger('send', {name: e.target.value});
    };
</login>
