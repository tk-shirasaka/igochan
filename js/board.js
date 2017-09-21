<board>
    <style>
        :scope {
            padding: 1vmin;
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

    <div if={size != undefined}>
        <div class='line' each={i in [...Array(size.value).keys()]}>
            <div each={j in [...Array(size.value).keys()]} class={cell: true, invisible: (i == (size.value - 1) || j == (size.value - 1)), star: (size.star.indexOf(i) >= 0 && size.star.indexOf(j) >= 0)}>
                <stone index={i * size.value + j} onclick={parent.parent.onclick}></stone>
            </div>
        </div>
        <slider></slider>
    </div>
    <div>
        <label class='mdl-radio mdl-js-radio mdl-js-ripple-effect' each={size in list} onclick={select}>
            <input class='mdl-radio__button' type='radio' name='size' value={size.value}>
            <span class='mdl-radio__label'>{size.value}路盤</span>
        </label>
    </div>

    var self = this;
    this.list = [
        {value: 9,  star: [4]},
        {value: 13, star: [3, 9]},
        {value: 19, star: [3, 9, 15]},
    ]

    this.websocket.on('receive:user', function(you) {
        self.status = you.status;
    });
    this.websocket.on('receive:game', function(history, agehama) {
        self.history = history;
        self.agehama = agehama;
        self.update();
    });
    this.websocket.on('historyback', function(limit) {
        self.limit = limit;
    });
    this.select = function(e) {
        self.size = e.item.size;
        self.update();
    };
    this.onclick = function(e) {
        if ((self.status == 0 || self.status == 2) && ['black', 'white'].indexOf(e.target.className) < 0) {
            var cell = Number(e.target._tag.opts.index);
            var checked = [];
            var agehama = [];
            var color = self.history.length % 2 ? 'white' : 'black';
            var opponent = self.history.length % 2 ? 'black' : 'white';

            self.tags.stone[cell].root.className = color;
            agehama = agehama.concat(self.check(cell - self.size.value, opponent, checked));
            agehama = agehama.concat(self.check(cell - 1, opponent, checked));
            agehama = agehama.concat(self.check(cell + 1, opponent, checked));
            agehama = agehama.concat(self.check(cell + self.size.value, opponent, checked));
            if (agehama.length === 0 && self.check(cell, color, []).length > 0) {
                self.tags.stone[cell].root.className = '';
            } else if (self.status == 0) {
                if (self.history.length !== self.limit) {
                    self.history.splice(self.limit);
                    self.agehama.splice(self.limit);
                }
                self.agehama.push(agehama);
                self.history.push(cell);
                self.websocket.trigger('receive:game', self.history, self.agehama);
            } else if (self.status == 2) {
                self.websocket.trigger('send', {index: cell, agehama: agehama});
            }
        }
    };
    this.check = function(cell, color, checked) {
        if (cell < 0 || cell >= self.size.value * self.size.value) return [];

        var opponent = color === 'black' ? 'white' : 'black';
        var top = cell >= self.size.value ? self.tags.stone[cell - self.size.value].root.className : opponent;
        var left = cell % self.size.value > 0 ? self.tags.stone[cell - 1].root.className : opponent;
        var right = cell % self.size.value < self.size.value - 1 ? self.tags.stone[cell + 1].root.className : opponent;
        var bottom = cell < self.size.value * (self.size.value - 1) ? self.tags.stone[cell + self.size.value].root.className : opponent;
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
        if (top === color && (agehama.top = self.check(cell - self.size.value, color, checked)).length === 0) return [];
        if (left === color && (agehama.left = self.check(cell - 1, color, checked)).length === 0) return [];
        if (right === color && (agehama.right = self.check(cell + 1, color, checked)).length === 0) return [];
        if (bottom === color && (agehama.bottom = self.check(cell + self.size.value, color, checked)).length === 0) return [];

        return [cell, ...agehama.top, ...agehama.left, ...agehama.right, ...agehama.bottom].filter(function(cell) { return cell >= 0; });
    };
</board>
