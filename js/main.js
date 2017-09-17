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
        function connect() {
            if (ws) return;

            ws = new WebSocket('wss://' + location.host + '/room');
            ws.onopen = function(evt) {
                retry = 0;
                ws.send(JSON.stringify({init: true}));
            };
            ws.onclose = function(evt) {
                ws = null;
                if (!retry) observable.trigger('receive:message', '接続が切れました');
                setTimeout(function() {
                    retry++;
                    connect();
                }, retry * 1000);
            };
            ws.onerror = function(evt) {
                ws = null;
                setTimeout(function() {
                    retry++;
                    connect();
                }, retry * 1000);
            };
            ws.onmessage = function(evt) {
                var data = JSON.parse(evt.data);

                if ('you' in data) observable.trigger('receive:user', data.you, data.users);
                if ('history' in data) observable.trigger('receive:game', data.history, data.agehama);
                if ('message' in data) observable.trigger('receive:message', data.message);
                console.log(data);
            };
        }

        window.addEventListener('unload', function(e) {
            ws.send(JSON.stringify({close: true}));
        });

        connect();
        riot.mount('*', {websocket: observable});
    }
})();
