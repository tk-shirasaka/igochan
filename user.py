# -*- coding: utf-8 -*-
import json
import random

users = set()

def search_by_websocket(ws):
    return [user for user in users if user._ws == ws].pop()

def search_by_name(name):
    user = [user for user in users if user._name == name and name != '']
    return None if len(user) == 0 else user.pop()

class User:
    def __init__(self, ws):
        users.add(self)
        self._ws = ws
        self._status = 0
        self._name = None
        self._size = None
        self._opponent = None
        self._history = None
        self._agehama = None
        self._group = set()
        self.send({'setting': self.dump(), 'message': u'接続しました'})

    def name(self, name):
        if search_by_name(name) == None:
            self._name = name
            self.send({'setting': self.dump()})
        else:
            self.send({'message': u'別の名前を入力してください'})

    def size(self, size):
        self._size = size
        self._group = users
        self.send({'setting': self.dump()})
        self.sendusers()

    def view(self, user):
        user = search_by_name(user)
        self._status = 1
        self._history = user._history
        self._agehama = user._agehama
        self._group = user._group
        self._group.add(self)
        self.send({'setting': self.dump(), 'history': self._history, 'agehama': self._agehama})
        self.sendusers()

    def request(self, user):
        opponent = search_by_name(user)
        self._opponent = opponent
        self._status = random.randint(2, 3)
        self._group = opponent._group = set()
        self._history = opponent._history = []
        self._agehama = opponent._agehama = []
        self._group.add(self)
        self._group.add(opponent)
        opponent.next(self._status)
        opponent._opponent = self
        self.send({'setting': self.dump(), 'history': self._history, 'agehama': self._agehama})
        opponent.send({'message': u'%sさんから対戦リクエストが来ました' % self._name, 'setting': opponent.dump(), 'history': opponent._history, 'agehama': opponent._agehama})
        self.sendusers()

    def history(self, index, agehama):
        self.next(self._status)
        self._opponent.next(self._status)
        self._history.append(index)
        self._agehama.append(agehama)
        self._opponent.send({'message': u'あなたの番です'})
        for user in self._group:
            user.send({'setting': user.dump(), 'history': user._history, 'agehama': user._agehama})

    def recoonect(self, user):
        user = search_by_name(user)
        if user:
            user._ws = self._ws
            user.send({'repair': True, 'history': user._history, 'agehama': user._agehama})
            self.close(self)

    def close(self):
        users.remove(self)
        self._group.remove(self)
        self.sendusers()

    def next(self, status):
        self._status = (status - 1) % 2 + 2

    def sendusers(self):
        for user in self._group:
            if user._ws and self._size == user._size:
                user._group.remove(user)
                user.send({'users': [other.dump() for other in user._group if other._name]})
                user._group.add(user)

    def send(self, data):
        self._ws.send(json.dumps(data))

    def dump(self):
        return {
            'name': self._name,
            'status': self._status,
            'size': self._size,
        }
