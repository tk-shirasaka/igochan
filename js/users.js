<users>
    <ul class='mdl-list'>
        <li each={websocket.users} class='mdl-list__item mdl-list__item--two-line'>
            <span class='mdl-list__item-primary-content'>
                <span>{name}</span>
                <span class='mdl-list__item-sub-title'>{parent.statusname(status)}</span>
            </span>
            <span class='mdl-list__item-secondary-action'>
                <button if={websocket.you.status <= 1 && websocket.you.name && status == 0} onclick={parent.start} class='mdl-button mdl-js-button mdl-button--raised  mdl-js-ripple-effect mdl-button--accent'>対戦</button>
                <button if={websocket.you.status == 0 && status >= 2} onclick={parent.view} class='mdl-button mdl-js-button mdl-button--raised  mdl-js-ripple-effect mdl-button--colored'>観戦</button>
            </span>
        </li>
    </ul>

    var self = this;

    this.start = function(e) {
        self.websocket.trigger('send', {request: e.item.name});
    };
    this.view = function(e) {
        self.websocket.trigger('send', {view: e.item.name});
    };
    this.statusname = function(status) {
        if (status == 0) return '待機中';
        if (status == 1) return '観戦中';
        if (status >= 2) return '対戦中';
    };
    this.websocket.on('receive:user', function() {
        self.update();
    });
</users>
