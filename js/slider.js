<slider>
    <style>
        :scope > div {
            text-align: center;
        }
        p {
            display: inline-block;
            width: 60%;
        }
    </style>

    <div if={[2, 3].indexOf(status) == -1}>
        <button class='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--primary' disabled={limit == 0} onclick={prev}>
            <i class='material-icons'>navigate_before</i>
        </button>
        <p>
            <input class='mdl-slider mdl-js-slider' type='range' min='0' max={history.length} value={limit} oninput={historyback} ref='slider'>
        </p>
        <button class='mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--primary' disabled={limit == history.length} onclick={next}>
            <i class='material-icons'>navigate_next</i>
        </button>
    </div>

    var self = this;
    this.limit = 0;

    this.websocket.on('receive:user', function(you) {
        self.status = you.status;
        if (self.status >= 2) self.websocket.trigger('historyback', history.length);
    });
    this.websocket.on('receive:game', function(history) {
        self.history = history;
        if (self.limit >= history.length - 1) self.websocket.trigger('historyback', history.length);
    });
    this.websocket.on('historyback', function(limit) {
        self.limit = limit;
        if ('slider' in self.refs) self.refs.slider.MaterialSlider.change(limit);
    });
    this.on('mount', function() {
        componentHandler.upgradeDom();
    })
    this.historyback = function(e) {
        self.websocket.trigger('historyback', parseInt(e.target.value));
    };
    this.prev = function() {
        self.websocket.trigger('historyback', self.limit - 1);
    };
    this.next = function() {
        self.websocket.trigger('historyback', self.limit + 1);
    };
</slider>
