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
        stone {
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
        .limitter {
            height: 60px !important;
        }
    </style>

    <div class='line' each={i in [...Array(size).keys()]}>
        <div each={j in [...Array(size).keys()]} class={cell: true, invisible: (i == (size - 1) || j == (size - 1)), star: ([3, 9, 15].indexOf(i) >= 0 && [3, 9, 15].indexOf(j) >= 0)}>
            <stone index={i * size + j} onclick={parent.parent.onclick}></stone>
        </div>
    </div>
    <input class='limitter mdl-slider mdl-js-slider' type='range' min='0' max={history.length} value={history.length} onchange={historyback}>

    var self = this;
    this.size = 19;

    this.websocket.on('receive:user', function(you) {
        self.status = you.status;
    });
    this.websocket.on('receive:game', function(history, agehama) {
        self.history = history;
        self.agehama = agehama;
        self.update();
    });
    this.onclick = function(e) {
        if ((self.status == 0 || self.status == 2) && ['black', 'white'].indexOf(e.target.className) < 0) {
            var cell = Number(e.target._tag.opts.index);
            var checked = [];
            var agehama = [];
            var color = self.history.length % 2 ? 'white' : 'black';
            var opponent = self.history.length % 2 ? 'black' : 'white';

            self.tags.stone[cell].root.className = color;
            agehama = agehama.concat(self.check(cell - self.size, opponent, checked));
            agehama = agehama.concat(self.check(cell - 1, opponent, checked));
            agehama = agehama.concat(self.check(cell + 1, opponent, checked));
            agehama = agehama.concat(self.check(cell + self.size, opponent, checked));
            if (agehama.length === 0 && self.check(cell, color, []).length > 0) {
                self.tags.stone[cell].root.className = '';
            } else if (self.status == 0) {
                self.agehama.push(agehama);
                self.history.push(cell);
                if (self.limit !== undefined) {
                    self.history.splice(self.limit);
                    self.agehama.splice(self.limit);
                    self.limit = undefined;
                }
                self.websocket.trigger('receive:game', self.history, self.agehama);
                self.websocket.trigger('historyback', self.limit);
            } else if (self.status == 2) {
                self.websocket.trigger('send', {index: cell, agehama: agehama});
            }
        }
    };
    this.check = function(cell, color, checked) {
        if (cell < 0 || cell >= self.size * self.size) return [];

        var opponent = color === 'black' ? 'white' : 'black';
        var top = cell >= self.size ? self.tags.stone[cell - self.size].root.className : opponent;
        var left = cell % self.size > 0 ? self.tags.stone[cell - 1].root.className : opponent;
        var right = cell % self.size < self.size - 1 ? self.tags.stone[cell + 1].root.className : opponent;
        var bottom = cell < self.size * (self.size - 1) ? self.tags.stone[cell + self.size].root.className : opponent;
        var agehama = {top: [], left: [], right: [], bottom: []};

        if (checked.indexOf(cell) < 0) {
            checked.push(cell);
        } else {
            return [-1];
        }
        if (self.tags.stone[cell].root.className !== color) return [];
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
        if (self.limit === self.history.length) self.limit = undefined;
        self.websocket.trigger('historyback', self.limit);
    };
</board>
