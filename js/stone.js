<stone>
    <style>
        :scope {
            z-index: 1;
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
        :scope.black {
            border: solid 1px;
            background: radial-gradient(#555, #000);
        }
        :scope.white {
            border: solid 1px;
            background: radial-gradient(#ddd, #fff);
        }
    </style>

    var self = this;

    this.websocket.on('receive:game', function(history, agehama) {
        self.history = history;
        self.agehama = agehama;
    });
    this.websocket.on('historyback', function(limit) {
        var i = self.history.lastIndexOf(opts.index);
        self.root.className = '';
        for (; i >= 0 && i < limit; i++) {
            if (self.root.className === '') {
                self.root.className = i % 2 ? 'white' : 'black';
            }
            if (self.agehama[i].indexOf(opts.index) >= 0) {
                self.root.className = '';
                break;
            }
        }
        self.update();
    });
</stone>
