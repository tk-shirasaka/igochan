<message>
    <div class='mdl-js-snackbar mdl-snackbar' ref='message'>
        <div class='mdl-snackbar__text'></div>
        <button class='mdl-snackbar__action' type='button'></button>
    </div>

    var self = this;

    this.websocket.on('receive:message', function(message) {
        self.refs.message.MaterialSnackbar.showSnackbar({
            message: message,
        });
        self.update();
    });
    this.on('mount', function() {
        componentHandler.upgradeDom();
    });
</message>
