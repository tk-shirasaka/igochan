<stone>
    <style>
        p {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
        .black {
            border: solid 1px;
            background: radial-gradient(#555, #000);
        }
        .white {
            border: solid 1px;
            background: radial-gradient(#ddd, #fff);
        }
    </style>

    <p if={color == 'black'} class='black'></p>
    <p if={color == 'white'} class='white'></p>
    <p if={color == ''} onclick={onclick}></p>

    var self = this;
    this.color = '';

    this.websocket.on('historyback', function(limit) {
        self.color = '';
        for (var i = self.websocket.history.slice(0, limit).lastIndexOf(opts.index); i >= 0 && i < limit; i++) {
            if (self.color === '') {
                self.color = i % 2 ? 'white' : 'black';
            }
            if (self.websocket.agehama[i].indexOf(opts.index) >= 0) {
                self.color = '';
                break;
            }
        }
        self.update();
    });
    this.onclick = function(e) {
        if (self.websocket.setting.status == 0 || self.websocket.setting.status == 2) self.websocket.trigger('execute', Number(opts.index));
    };
</stone>
