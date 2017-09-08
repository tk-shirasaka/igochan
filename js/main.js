(function () {
    var WebSocket = 'WebSocket' in window ? window.WebSocket : window.MozWebSocket;

    if (WebSocket !== undefined) {
        var ws = new WebSocket('ws://localhost:10005/room');
        ws.onmessage = function(evt) {
            console.log(evt);
        }

        document.querySelector('#login > input').addEventListener('change', function(e) {
            ws.send(e.target.value);
        });
        document.querySelectorAll('#board td > div').forEach(function(elm, i) {
            elm.addEventListener('click', function() {
                if (!(elm.className in ['black', 'white'])) {
                    elm.className = 'black';
                    ws.send(i);
                }
            });
        });
    }
})();
