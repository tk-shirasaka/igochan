<board>
    <style>
        :scope {
            padding-top: 10vmin;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .line {
            display: flex;
            justify-content: center;
            width: 90vmin;
        }
        .cell {
            flex-grow: 1;
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
    </style>

    <div if={websocket.setting.size}>
        <div class='line' each={i in [...Array(websocket.setting.size).keys()]}>
            <div each={j in [...Array(websocket.setting.size).keys()]} class={cell: true, invisible: (i == (websocket.setting.size - 1) || j == (websocket.setting.size - 1)), star: (stars[websocket.setting.size].indexOf(i) >= 0 && stars[websocket.setting.size].indexOf(j) >= 0)}>
                <stone index={i * websocket.setting.size + j} onclick={parent.parent.onclick}></stone>
            </div>
        </div>
    </div>

    var self = this;
    this.stars = {9: [4], 13:[3, 9], 19:[3, 9, 15]};

    this.websocket.on('receive:setting', function() {
        self.update();
    });
    this.websocket.on('historyback', function(limit) {
        self.limit = limit;
    });
    this.onclick = function(e) {
        if ([0, 2].indexOf(self.websocket.setting.status) >= 0 && ['black', 'white'].indexOf(e.target.className) < 0) {
            var cell = Number(e.target._tag.opts.index);
            var checked = [];
            var agehama = [];
            var color = self.websocket.history.length % 2 ? 'white' : 'black';
            var opponent = self.websocket.history.length % 2 ? 'black' : 'white';

            self.tags.stone[cell].root.className = color;
            agehama = agehama.concat(self.check(cell - self.websocket.setting.size, opponent, checked));
            agehama = agehama.concat(self.check(cell - 1, opponent, checked));
            agehama = agehama.concat(self.check(cell + 1, opponent, checked));
            agehama = agehama.concat(self.check(cell + self.websocket.setting.size, opponent, checked));
            if (agehama.length === 0 && self.check(cell, color, []).length > 0) {
                self.tags.stone[cell].root.className = '';
            } else {
                if (self.limit !== undefined && self.websocket.history.length !== self.limit) {
                    self.websocket.history.splice(self.limit);
                    self.websocket.agehama.splice(self.limit);
                }
                self.websocket.agehama.push(agehama);
                self.websocket.history.push(cell);
                self.websocket.trigger('historyback', self.websocket.history.length);
                if (self.websocket.setting.status == 2) self.websocket.trigger('send', {index: cell, agehama: agehama});
            }
        }
    };
    this.check = function(cell, color, checked) {
        if (cell < 0 || cell >= self.websocket.setting.size * self.websocket.setting.size) return [];

        var opponent = color === 'black' ? 'white' : 'black';
        var top = cell >= self.websocket.setting.size ? self.tags.stone[cell - self.websocket.setting.size].root.className : opponent;
        var left = cell % self.websocket.setting.size > 0 ? self.tags.stone[cell - 1].root.className : opponent;
        var right = cell % self.websocket.setting.size < self.websocket.setting.size - 1 ? self.tags.stone[cell + 1].root.className : opponent;
        var bottom = cell < self.websocket.setting.size * (self.websocket.setting.size - 1) ? self.tags.stone[cell + self.websocket.setting.size].root.className : opponent;
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
        if (top === color && (agehama.top = self.check(cell - self.websocket.setting.size, color, checked)).length === 0) return [];
        if (left === color && (agehama.left = self.check(cell - 1, color, checked)).length === 0) return [];
        if (right === color && (agehama.right = self.check(cell + 1, color, checked)).length === 0) return [];
        if (bottom === color && (agehama.bottom = self.check(cell + self.websocket.setting.size, color, checked)).length === 0) return [];

        return [cell, ...agehama.top, ...agehama.left, ...agehama.right, ...agehama.bottom].filter(function(cell) { return cell >= 0; });
    };
</board>
