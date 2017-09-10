<login>
    <div if={you === undefined || !you.name} class='mdl-textfield mdl-js-textfield'>
        <input class='mdl-textfield__input' type='text' onchange={onchange}>
        <label class='mdl-textfield__label'>ユーザー名</label>
    </div>

    var self = this;

    this.opts.websocket.on('receive', function(data) {
        self.you = data.you;
        self.update();
    });
    this.onchange = function(e) {
        opts.websocket.trigger('send', {name: e.target.value});
    };
</login>
