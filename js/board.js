<board>
    <style>
        :scope {
            padding: 1vmin;
        }
        .line {
            display: flex;
            justify-content: center;
        }
        .cell {
            width: 5vmin;
            position: relative;
            margin: -1px;
            border: 1px solid black;
            background: moccasin;
        }
        .cell:before {
            content: '';
            display: block;
            padding-top: 100%;
        }
        .cell.invisible {
            visibility: visible;
            border: none;
            background: none;
        }
        .cell.star:after {
            content: '';
            width: 5px;
            height: 5px;
            top: -3px;
            left: -3px;
            position: absolute;
            background: black;
            border-radius: 50%;
        }
        .cell > div {
            position: absolute;
            width: 90%;
            height: 90%;
            top: -50%;
            left: -50%;
        }
        .cell.invisible > div {
            width: calc(90% - 2px);
            height: calc(90% - 2px);
            top: calc(-50% + 1px);
            left: calc(-50% + 1px);
        }
        .black, .white {
            border: solid 1px;
            border-radius: 50%;
        }
        .black {
            background: #000;
        }
        .white {
            background: #fff;
        }
    </style>

    <div class='line' each={line, i in map}>
        <div each={col, j in line} class={cell: true, invisible: (i == (size - 1) || j == (size - 1)), star: ([3, 9, 15].indexOf(i) >= 0 && [3, 9, 15].indexOf(j) >= 0)}>
            <div class={col} onclick={parent.parent.onclick}></div>
        </div>
    </div>
    <input class='mdl-slider mdl-js-slider' type='range' min='0' max={(history == undefined ? [] : history).length} value={(history == undefined ? [] : history).length} onchange={historyback}>

    var self = this;
    this.size = 19;
    this.map = [...Array(self.size).keys()].map(function(i) { return [...Array(self.size).keys()].map(function(j) { return i * self.size + j})});

    this.opts.websocket.on('receive', function(data) {
        self.you = data.you;
        self.history = data.history;
        self.agehama = data.agehama;
        self.setmap(data.agehama);
        self.update();
    });
    this.setmap = function() {
        if (self.history === undefined) return;
        self.map = [...Array(self.size).keys()].map(function(i) { return [...Array(self.size).keys()].map(function(j) { return i * self.size + j})});
        self.color = self.history.length % 2 ? 'white' : 'black';
        self.opponent = self.history.length % 2 ? 'black' : 'white';
        self.history.some(function(cell, index) {
            if (self.limit != undefined && self.limit <= index) return true;
            self.map[parseInt(cell / self.size)][cell % self.size] = index % 2 ? 'white' : 'black';
            if (index in self.agehama) {
                self.agehama[index].forEach(function(cell) {
                    self.map[parseInt(cell / self.size)][cell % self.size] = cell;
                });
            }
        });
    };
    this.onclick = function(e) {
        if ((self.you.status == 0 || self.you.status == 2) && ['black', 'white'].indexOf(e.target.className) < 0) {
            var cell = Number(e.target.className);
            var x = parseInt(cell / self.size);
            var y = cell % self.size;
            var checked = [];
            var agehama = [];

            self.map[x][y] = self.color;
            agehama = agehama.concat(self.check(cell - self.size, self.opponent, checked));
            agehama = agehama.concat(self.check(cell - 1, self.opponent, checked));
            agehama = agehama.concat(self.check(cell + 1, self.opponent, checked));
            agehama = agehama.concat(self.check(cell + self.size, self.opponent, checked));
            if (agehama.length === 0 && self.check(cell, self.color, []).length > 0) {
                self.map[x][y] = cell;
            } else if (self.you.status == 0) {
                if (self.history === undefined) {
                    self.history = [];
                    self.agehama = {};
                }
                if (agehama.length) self.agehama[self.history.length - 1] = agehama;
                if (self.limit !== undefined) self.history.splice(self.limit);
                self.limit = undefined;
                self.history.push(e.target.className);
                self.setmap();
                self.update();
            } else if (self.you.status == 2) {
                opts.websocket.trigger('send', {index: e.target.className, agehama: agehama});
            }
        }
    };
    this.check = function(cell, color, checked) {
        var x = parseInt(cell / self.size);
        var y = cell % self.size;
        var opponent = color === 'black' ? 'white' : 'black';
        var top = x > 0 && y >= 0 && y <= (self.size - 1) ? self.map[x - 1][y] : opponent;
        var left = y > 0 && x >= 0 && x <= (self.size - 1) ? self.map[x][y - 1] : opponent;
        var right = y < (self.size - 1) && x >= 0 && x <= (self.size - 1) ? self.map[x][y + 1] : opponent;
        var bottom = x < (self.size - 1) && y >= 0 && y <= (self.size - 1) ? self.map[x + 1][y] : opponent;
        var agehama = {top: [], left: [], right: [], bottom: []};

        if (checked.indexOf(cell) < 0) {
            checked.push(cell);
        } else {
            return [-1];
        }
        if (x < 0 || x > (self.size - 1) || y < 0 || y > (self.size - 1) || self.map[x][y] !== color) return [];
        if (['black', 'white'].indexOf(top) < 0) return [];
        if (['black', 'white'].indexOf(left) < 0) return [];
        if (['black', 'white'].indexOf(right) < 0) return [];
        if (['black', 'white'].indexOf(bottom) < 0) return [];
        if (top === color && (agehama.top = self.check(cell - self.size, color, checked)).length === 0) return [];
        if (left === color && (agehama.left = self.check(cell - 1, color, checked)).length === 0) return [];
        if (right === color && (agehama.right = self.check(cell + 1, color, checked)).length === 0) return [];
        if (bottom === color && (agehama.bottom = self.check(cell + self.size, color, checked)).length === 0) return [];

        return [cell, ...agehama.top, ...agehama.left, ...agehama.right, ...agehama.bottom].filter(function(cell) { return cell >= 0; });
    };
    this.historyback = function(e) {
        self.limit = parseInt(e.target.value);
        self.setmap();
    };
</board>
