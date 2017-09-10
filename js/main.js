(function () {
    var WebSocket = 'WebSocket' in window ? window.WebSocket : window.MozWebSocket;
    var observable = new function() {
        riot.observable(this);
        this.on('send', function(data) {
            ws.send(JSON.stringify(data));
        });
    };

    if (WebSocket !== undefined) {
        var ws = new WebSocket('ws://' + location.host + '/room');
        ws.onmessage = function(evt) {
            var data = JSON.parse(evt.data);

            console.log(data);
            observable.trigger('receive', data);
        };

        riot.mount('*', {websocket: observable});
    }
})();
