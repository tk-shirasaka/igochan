# -*- coding: utf-8 -*-
import os
import json
from user import User, users, search_by_websocket, search_by_name
from bottle.ext.websocket import GeventWebSocketServer, websocket
from bottle import route, static_file, run

base = os.path.dirname(os.path.abspath(__file__))

@route('/')
def index():
    return static_file('index.html', root=base)

@route('/room', apply=[websocket])
def room(ws):
    users.add(User(ws))

    while True:
        message = ws.receive()
        current = search_by_websocket(ws)

        if message is None:
            break;
        else:
            message = json.loads(message)
            current.set(message)
            for user in current.group if 'index' in message else users:
                senddata = {}
                if 'init' in message:
                    if user == current:
                        senddata = {'message': '接続しました'}
                    else:
                        continue
                elif 'name' in message and current.name == None and user == current:
                    senddata = {'message': '別の名前を入力してください'}
                elif 'setting' in message and user == current:
                    senddata = {'history': current.history, 'agehama': current.agehama}
                elif 'request' in message:
                    if user == current:
                        senddata = {'history': user.history, 'agehama': user.agehama}
                    elif message['request'] == user.name:
                        senddata = {'message': '%sさんから対戦リクエストが来ました' % current.name, 'request': current.name, 'history': user.history, 'agehama': user.agehama}
                elif 'view' in message and user == current:
                    parent = search_by_name(message['view'])
                    senddata = {'history': parent.history, 'agehama': parent.agehama}
                elif 'index' in message:
                    senddata = {'history': current.history, 'agehama': current.agehama}
                    if user.status == 2: senddata.update({'message': 'あなたの番です'})

                senddata.update({'you': user.dump(), 'users': [other.dump() for other in users if other.ready(user)]})
                if user.ws: user.ws.send(json.dumps(senddata))

    if current.name == None:
        users.remove(current)
    else:
        current.ws = None

@route('/js/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'js'))

@route('/css/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'css'))


run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)), server=GeventWebSocketServer, debug=True)
