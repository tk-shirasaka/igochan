<setting>
    <style>
        .dialog {
            position: fixed;
            display: table;
            top: 20%;
            left: 0;
            right: 0;
            margin: auto;
        }
    </style>

    <div class='material-icons mdl-badge mdl-badge--overlap' data-badge={connection ? '' : '!'}>wifi</div>
    <button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect' onclick={view}>
        <i class='material-icons'>settings_applications</i>
    </button>
    <span class='mdl-typography--title'>{name}</span>
    <div if={visible} class='dialog mdl-card mdl-shadow--2dp'>
        <div class='mdl-card__title'>
            <h2 class='mdl-card__title-text'>設定</h2>
        </div>
        <div class='mdl-card__supporting-text'>
            <div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
                <label class='mdl-textfield__label' for='name'>お名前</label>
                <input id='name' class='mdl-textfield__input' type='text' value={name} onchange={onchange} disabled={name}>
            </div>
            <div each={size in sizelist}>
                <label class='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect' onclick={select}>
                    <input class='mdl-checkbox__input' type='checkbox' value={size} checked={size == setting.size}>
                    <span class='mdl-checkbox__label'>{size}路盤</span>
                </label>
            </div>
        </div>
    </div>

    var self = this;
    this.visible = false;
    this.sizelist = [9, 13, 19];

    this.websocket.on('connection', function(condition) {
        self.connection = condition;
        self.update();
    });
    this.websocket.on('receive:user', function(you) {
        if (self.name !== undefined && self.name && !you.name) self.websocket.trigger('send', {reconnect: self.name});
        self.name = you.name;
        self.status = you.status;
        self.setting = you.setting;
        if (self.setting.size === undefined) self.view();
    });
    this.websocket.on('receive:repair', function() {
        self.visible = false;
        self.update();
    });
    this.on('*', function() {
        componentHandler.upgradeDom();
    });
    this.view = function() {
        if (self.status == 0) {
            self.visible = true;
            self.update();
        }
    };
    this.onchange = function(e) {
        self.websocket.trigger('send', {name: e.target.value});
    };
    this.select = function(e) {
        self.visible = false;
        self.websocket.trigger('send', {setting: {size: e.item.size}});
    };
</setting>
