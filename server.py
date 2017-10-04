# -*- coding: utf-8 -*-
import os
import json
from user import User, search_by_websocket
from bottle.ext.websocket import GeventWebSocketServer, websocket
from bottle import route, static_file, response, run

base = os.path.dirname(os.path.abspath(__file__))

@route('/')
def index():
    return static_file('index.html', root=base)

@route('/room', apply=[websocket])
def room(ws):
    User(ws)

    while True:
        message = ws.receive()
        current = search_by_websocket(ws)

        if message is None:
            break;
        else:
            message = json.loads(message)
            if 'open' in message:
                current.open(message['open'])
            elif 'name' in message:
                current.name(message['name'])
            elif 'size' in message:
                current.size(message['size'])
            elif 'view' in message:
                current.view(message['view'])
            elif 'request' in message:
                current.request(message['request'])
            elif 'accept' in message:
                current.accept()
            elif 'refuse' in message:
                current.refuse()
            elif 'index' in message and 'agehama' in message:
                current.history(message['index'], message['agehama'])
            elif 'reconnect' in message:
                current.reconnect(message['reconnect'])
            elif 'close' in message:
                current.close()

    if current:
        current.ws = None

@route('/download/<sgf>')
def download(sgf):
    response.contet_type = 'application/octet-stream'
    response.headers['Content-Disposition'] = 'attachement; filename=igochan.sgf'
    return sgf

@route('/js/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'js'))

@route('/css/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'css'))


run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)), server=GeventWebSocketServer, debug=True)
