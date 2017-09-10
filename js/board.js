<board>
    <style>
        table {
            margin: 8px auto 0;
            width: calc(100vmin - 80px);
            height: calc(100vmin - 80px);
            background: moccasin;
        }
        td {
            position: relative;
        }
        div {
            position: absolute;
            width: 100%;
            height: 100%;
            top: -50%;
            left: -50%;
        }
        div.black, div.white {
            border: solid 1px;
            border-radius: 50%;
        }
        div.black {
            background: #000;
        }
        div.white {
            background: #fff;
        }
    </style>

    <table if={you !== undefined && you.status > 0} border='1' cellspacing='0'>
        <tbody>
            <tr each={i in [...Array(18).keys()]}>
                <td each={j in [...Array(18).keys()]}>
                    <div class={parent.parent.getclass(i * 18 + j)} onclick={parent.parent.onclick}></div>
                </td>
            </tr>
        </tbody>
    </table>

    var self = this;

    this.opts.websocket.on('receive', function(data) {
        var history = self.history;
        self.you = data.you;
        if ('history' in data) self.history = data.history;
        if (history === undefined || 'history' in data) self.update();
    });
    this.getclass = function(index) {
        switch (self.history === undefined ? -1 : self.history.indexOf(String(index)) % 2) {
            case -1:
                return index;
            case 0:
                return 'black';
            case 1:
                return 'white';
        }
    };
    this.onclick = function(e) {
        if (self.you.status == 2 && ['black', 'white'].indexOf(e.target.className) < 0) {
            opts.websocket.trigger('send', {index: e.target.className});
        }
    };
</board>
