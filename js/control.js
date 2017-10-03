<control>
    <style>
        :scope {
            z-index: 1;
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
        }
        .control {
            padding: 15px;
            text-align: center;
            background: rgba(0, 0, 0, 0.5);
        }
        .toggle {
            padding: 15px;
            text-align: right;
        }
        p {
            display: inline-block;
            width: 60%;
        }
    </style>

    <div if={expandable} class='toggle'>
        <button class='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--colored' onclick={toggle}>
            <i class='material-icons'>{hidden ? 'expand_more' : 'expand_less'}</i>
        </button>
    </div>

    <div if={!hidden} class='control'>
        <div>
            <button class='mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary' onclick={pass} disabled={[0, 2].indexOf(websocket.setting.status) == -1}>パス</button>
            <button class='mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent' onclick={resign} disabled={websocket.setting.status != 2}>投了</button>
        </div>
        <div if={[0, 1].indexOf(websocket.setting.status) != -1}>
            <button class='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--primary' disabled={limit == 0} onclick={prev}>
                <i class='material-icons'>navigate_before</i>
            </button>
            <p>
                <input class='mdl-slider mdl-js-slider' type='range' min='0' max={websocket.history.length} value={limit} oninput={historyback} ref='slider'>
            </p>
            <button class='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--primary' disabled={limit == websocket.history.length} onclick={next}>
                <i class='material-icons'>navigate_next</i>
            </button>
        </div>
    </div>

    var self = this;
    this.limit = 0;
    this.hidden = true;
    this.expandable = false;

    window.addEventListener('resize', function() {
        self.initialize();
    });
    this.websocket.on('receive:setting', function() {
        self.initialize();
    });
    this.websocket.on('receive:game', function() {
        if (self.websocket.setting.status >= 1 && self.limit === self.websocket.history.length - 1) self.websocket.trigger('historyback', self.websocket.history.length);
    });
    this.websocket.on('reset', function() {
        self.websocket.trigger('historyback', 0);
    });
    this.websocket.on('historyback', function(limit) {
        self.limit = limit;
        if ('slider' in self.refs) self.refs.slider.MaterialSlider.change(limit);
        self.update();
    });
    this.on('*', function() {
        componentHandler.upgradeDom();
    });
    this.initialize = function() {
        if (self.websocket.setting.size) {
            self.expandable = window.innerHeight < window.innerWidth * 1.4;
            self.hidden = self.expandable ? self.hidden : false;
            self.update();
        }
    };
    this.toggle = function() {
        self.hidden = !self.hidden;
        self.update();
    };
    this.historyback = function(e) {
        self.websocket.trigger('historyback', parseInt(e.target.value));
    };
    this.prev = function() {
        self.websocket.trigger('historyback', self.limit - 1);
    };
    this.next = function() {
        self.websocket.trigger('historyback', self.limit + 1);
    };
    this.pass = function() {
        self.websocket.trigger('execute', -1);
    };
    this.resign = function() {
        self.websocket.trigger('execute', -2);
    };
</control>
