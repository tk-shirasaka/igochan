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
    <button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect' onclick={open}>
        <i class='material-icons'>settings_applications</i>
    </button>
    <span class='mdl-typography--title'>{websocket.setting.name}</span>
    <div if={visible} class='dialog mdl-card mdl-shadow--2dp'>
        <div class='mdl-card__title'>
            <h2 class='mdl-card__title-text'>設定</h2>
        </div>
        <div class='mdl-card__supporting-text'>
            <div class='mdl-textfield mdl-js-textfield mdl-textfield--floating-label'>
                <label class='mdl-textfield__label' for='name'>お名前</label>
                <input id='name' class='mdl-textfield__input' type='text' value={websocket.setting.name} onchange={onchange} disabled={websocket.setting.name}>
            </div>
            <div each={size in sizelist}>
                <label class='mdl-radio mdl-js-radio mdl-js-ripple-effect'>
                    <input class='mdl-radio__button' name='size' type='radio' value={size} onclick={select} checked={size == websocket.setting.size} disabled={websocket.setting.status}>
                    <span class='mdl-radio__label'>{size}路盤</span>
                </label>
            </div>
        </div>
        <div class='mdl-card__actions mdl-card--border'>
            <label class='mdl-button mdl-js-button mdl-button--icon mdl-button--colored'>
                <i class='material-icons'>attach_file</i>
                <input class='hidden' type='file' onchange={load}>
            </label>
            <button if={websocket.history.length} class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' onclick={dump}>棋譜を保存</button>
        </div>
        <div if={request} class='mdl-card__actions mdl-card--border'>
            <button class='mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect' onclick={refuse}>拒否</button>
            <button class='mdl-button mdl-button--colored mdl-button--raised mdl-js-button mdl-js-ripple-effect' onclick={accept}>承認</button>
        </div>
        <div if={websocket.setting.size} class='mdl-card__menu'>
            <button class='mdl-button mdl-button--icon mdl-js-button mdl-button--colored mdl-js-ripple-effect' onclick={close}>
                <i class='material-icons'>close</i>
            </button>
        </div>
    </div>

    var self = this;
    this.visible = false;
    this.request = false;
    this.sizelist = [9, 13, 19];
    this.index = 'abcdefghijklmnopqrs';

    this.websocket.on('connection', function(condition) {
        self.connection = condition;
        self.update();
    });
    this.websocket.on('execute', function() {
        self.close();
    });
    this.websocket.on('receive:setting', function() {
        self.update();
        if (!self.websocket.setting.size) self.open();
        if (self.websocket.setting.status > 0) self.close();
    });
    this.websocket.on('receive:request', function() {
        self.request = true;
        self.open();
    });
    this.on('*', function() {
        componentHandler.upgradeDom();
    });
    this.open = function() {
        self.visible = true;
        self.update();
    };
    this.close = function() {
        self.visible = self.request = false;
        self.update();
    };
    this.onchange = function(e) {
        self.websocket.trigger('send', {name: e.target.value});
    };
    this.select = function(e) {
        if (self.websocket.setting.size !== e.item.size) {
            self.websocket.trigger('reset');
            self.websocket.trigger('send', {size: e.item.size});
        }
    };
    this.refuse = function(e) {
        self.close();
        self.websocket.trigger('send', {refuse: true});
    };
    this.accept = function(e) {
        self.close();
        self.websocket.trigger('send', {accept: true});
    };
    this.dump = function(e) {
        var size = self.websocket.setting.size;
        var str = '(;GM[1]FF[4]SZ[' + size + ']';
        var colors = ['B', 'W'];

        self.websocket.history.forEach(function(c, i) {
            c = (i === -1)
                ? 'tt'
                : self.index[Math.floor(c / size)] + self.index[c % size];
            str += ';' + colors[i % 2] + '[' + c + ']';
        });
        str += ')';
        window.open('/download/' + str, '_blank');
    };
    this.load = function(e) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var sgf = e.target.result.split(';');

            if (sgf.shift() !== '(' || sgf[0].indexOf('GM[1]') < 0 && !sgf[0].match(/SZ\[(\d*)\]/)) return;
            self.websocket.trigger('reset');
            self.websocket.trigger('send', {size: Number(sgf.shift().match(/SZ\[(\d*)\]/).pop())});
            setTimeout(function() { 
                var size = self.websocket.setting.size;
                sgf.forEach(function(c, i) {
                    c = c.match(/\[(\w*)\]/).pop();
                    i = (c === 'tt')
                        ? -1
                        : self.index.indexOf(c[0]) * size + self.index.indexOf(c[1]);
                    self.websocket.trigger('execute', i);
                });
            }, 100);
        }
        reader.readAsText(e.target.files[0]);
    };
</setting>
