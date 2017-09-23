(function () {
    var WebSocket = 'WebSocket' in window ? window.WebSocket : window.MozWebSocket;
    var observable = new function() {
        riot.observable(this);
        this.on('send', function(data) {
            ws.send(JSON.stringify(data));
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
                observable.trigger('receive:message', '接続が切れました');
            }
            setTimeout(function() {
                retry++;
                connect();
            }, retry * 1000);
        };
        var onmessage = function(evt) {
            var data = JSON.parse(evt.data);

            if ('you' in data) observable.trigger('receive:user', data.you, data.users);
            if ('history' in data) observable.trigger('receive:game', data.history, data.agehama);
            if ('message' in data) observable.trigger('receive:message', data.message);
            if ('repair' in data) observable.trigger('receive:repair');
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
