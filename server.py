import os
from user import User
from bottle.ext.websocket import GeventWebSocketServer, websocket
from bottle import route, static_file, run

base = os.path.dirname(os.path.abspath(__file__))
users = set()

@route('/')
def index():
    return static_file('index.html', root=base)

@route('/room', apply=[websocket])
def room(ws):
    users.add(User(ws))
    while True:
        message = ws.receive()
        current = [user for user in users if user.ws == ws].pop()

        if message is None:
            break;
        else:
            for user in users:
                user.name = message
                user.ws.send('Hello')
    users.remove(current)

@route('/js/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'js'))

@route('/css/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'css'))


run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)), debug=True)
