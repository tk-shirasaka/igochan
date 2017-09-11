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
                if 'name' in message:
                    if current.name and user != current: senddata = {'message': u'%sさんが入室しました' % current.name}
                    if current.name == None and user == current: senddata = {'message': u'別の名前を入力してください'}
                elif 'request' in message and message['request'] == user.name:
                    senddata = {'message': u'%sさんから対戦リクエストが来ました' % current.name, 'request': current.name}
                elif 'view' in message and user == current:
                    senddata = {'history': search_by_name(message['view']).history}
                elif 'index' in message:
                    senddata = {'history': current.history}
                    if user.status == 2: senddata.update({'message': 'あなたの番です'})

                senddata.update({'you': user.dump(), 'users': [other.dump() for other in users if other != user]})
                user.ws.send(json.dumps(senddata))
    users.remove(current)

@route('/js/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'js'))

@route('/css/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'css'))


run(host='0.0.0.0', port=int(os.environ.get('PORT', 80)), server=GeventWebSocketServer, debug=True)
