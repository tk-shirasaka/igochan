(function () {
    var WebSocket = 'WebSocket' in window ? window.WebSocket : window.MozWebSocket;
    var observable = new function() {
        this.setting = {};
        this.users = [];
        this.history = [];
        this.agehama = [];
        riot.observable(this);
        this.on('send', function(data) {
            ws.send(JSON.stringify(data));
        });
        this.on('set:setting', function(setting) {
            observable.setting = setting;
            observable.trigger('receive:setting');
        });
        this.on('set:users', function(users) {
            observable.users = users;
            observable.trigger('receive:users');
        });
        this.on('set:game', function(history, agehama) {
            observable.history = history;
            observable.agehama = agehama;
            observable.trigger('receive:game');
        });
        this.on('set:message', function(message) {
            observable.message = message;
            observable.trigger('receive:message');
        });
        this.on('set:repair', function() {
            observable.trigger('receive:repair');
        });
    };

    if (WebSocket !== undefined) {
        var ws = null;
        var retry = 0;
        var connect = function() {
            if (ws) return;

            ws = new WebSocket('wss://' + location.host + '/room');
            ws.onopen = onopen;
            ws.onclose = reconnect; 
            ws.onerror = reconnect; 
            ws.onmessage = onmessage;
        };
        var onopen = function(evt) {
            retry = 0;
            ws.send(JSON.stringify({init: true}));
            observable.trigger('connection', true);
        };
        var reconnect = function(evt) {
            ws = null;
            if (!retry) {
                observable.trigger('connection', false);
                observable.trigger('set:message', '接続が切れました');
            }
            setTimeout(function() {
                retry++;
                connect();
            }, retry * 1000);
        };
        var onmessage = function(evt) {
            var data = JSON.parse(evt.data);

            if ('setting' in data) observable.trigger('set:setting', data.setting);
            if ('users' in data) observable.trigger('set:users', data.users);
            if ('history' in data) observable.trigger('set:game', data.history, data.agehama);
            if ('message' in data) observable.trigger('set:message', data.message);
            if ('repair' in data) observable.trigger('set:repair');
            console.log(data);
        };

        window.addEventListener('beforeunload', function(e) {
            ws.send(JSON.stringify({close: true}));
        });

        connect();
        riot.mixin({websocket: observable})
        riot.mount('*');
    }
})();
