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
            width: calc(100% - 2px);
            height: calc(100% - 2px);
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
            <tr each={line in map}>
                <td each={col in line}>
                    <div class={col} onclick={parent.parent.onclick}></div>
                </td>
            </tr>
        </tbody>
    </table>

    var self = this;
    this.map = [...Array(18).keys()].map(function(i) { return [...Array(18).keys()].map(function(j) { return i * 18 + j})});

    this.opts.websocket.on('receive', function(data) {
        self.you = data.you;
        if ('history' in data && 'agehama' in data) {
            self.setmap(data.history, data.agehama);
            self.color = data.history.length % 2 ? 'white' : 'black';
            self.opponent = data.history.length % 2 ? 'black' : 'white';
        }
        self.update();
    });
    this.setmap = function(history, agehama) {
        history.forEach(function(cell, index) {
            self.map[parseInt(cell / 18)][cell % 18] = index % 2 ? 'white' : 'black';
            if (index in agehama) {
                agehama[index].forEach(function(cell) {
                    self.map[parseInt(cell / 18)][cell % 18] = cell;
                });
            }
        });
    };
    this.onclick = function(e) {
        if (self.you.status == 2 && ['black', 'white'].indexOf(e.target.className) < 0) {
            var cell = Number(e.target.className);
            var x = parseInt(cell / 18);
            var y = cell % 18;
            var checked = [];
            var agehama = [];

            self.map[x][y] = self.color;
            agehama = agehama.concat(self.check(cell - 18, self.opponent, checked));
            agehama = agehama.concat(self.check(cell - 1, self.opponent, checked));
            agehama = agehama.concat(self.check(cell + 1, self.opponent, checked));
            agehama = agehama.concat(self.check(cell + 18, self.opponent, checked));
            if (agehama.length === 0 && self.check(cell, self.color, []).length > 0) {
                self.map[x][y] = cell;
            } else {
                opts.websocket.trigger('send', {index: e.target.className, agehama: agehama});
            }
        }
    };
    this.check = function(cell, color, checked) {
        var x = parseInt(cell / 18);
        var y = cell % 18;
        var opponent = color === 'black' ? 'white' : 'black';
        var top = x > 0 && y >= 0 && y <= 17 ? self.map[x - 1][y] : opponent;
        var left = y > 0 && x >= 0 && x <= 17 ? self.map[x][y - 1] : opponent;
        var right = y < 17 && x >= 0 && x <= 17 ? self.map[x][y + 1] : opponent;
        var bottom = x < 17 && y >= 0 && y <= 17 ? self.map[x + 1][y] : opponent;
        var agehama = {top: [], left: [], right: [], bottom: []};

        if (checked.indexOf(cell) < 0) {
            checked.push(cell);
        } else {
            return [-1];
        }
        if (x < 0 || x > 17 || y < 0 || y > 17 || self.map[x][y] !== color) return [];
        if (['black', 'white'].indexOf(top) < 0) return [];
        if (['black', 'white'].indexOf(left) < 0) return [];
        if (['black', 'white'].indexOf(right) < 0) return [];
        if (['black', 'white'].indexOf(bottom) < 0) return [];
        if (top === color && (agehama.top = self.check(cell - 18, color, checked)).length === 0) return [];
        if (left === color && (agehama.left = self.check(cell - 1, color, checked)).length === 0) return [];
        if (right === color && (agehama.right = self.check(cell + 1, color, checked)).length === 0) return [];
        if (bottom === color && (agehama.bottom = self.check(cell + 18, color, checked)).length === 0) return [];

        return [cell, ...agehama.top, ...agehama.left, ...agehama.right, ...agehama.bottom].filter(function(cell) { return cell >= 0; });
    };
</board>
