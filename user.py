# -*- coding: utf-8 -*-
import json
import random

users = set()

def search_by_websocket(ws):
    user = [user for user in users if user._ws == ws]
    return None if len(user) == 0 else user.pop()

def search_by_id(id):
    user = [user for user in users if user._id == id]
    return None if len(user) == 0 else user.pop()

class User:
    def __init__(self, ws):
        users.add(self)
        self._ws = ws
        self._status = 0
        self._id = None
        self._name = None
        self._size = None
        self._opponent = None
        self._history = None
        self._agehama = None
        self._group = set()

    def open(self, id):
        user = search_by_id(id)
        if user:
            self.close()
            user._ws = self._ws
            user.send({'setting': user.dump()})
            user.sendusers()
            if user._status > 0:
                user.send({'history': user._history, 'agehama': user._agehama})
        else:
            self._id = id
            self.send({'setting': self.dump()})

    def name(self, name):
        self._name = name
        self.send({'setting': self.dump()})

    def size(self, size):
        self._size = size
        self._group = users
        self.send({'setting': self.dump()})
        self.sendusers()

    def view(self, id):
        user = search_by_id(id)
        self._status = 1
        self._history = user._history
        self._agehama = user._agehama
        self._group = user._group
        self._group.add(self)
        self.send({'setting': self.dump(), 'history': self._history, 'agehama': self._agehama})
        self.sendusers()

    def request(self, id):
        opponent = search_by_id(id)
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

    def close(self):
        users.add(self)
        users.remove(self)
        self._group.add(self)
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
        try:
            self._ws.send(json.dumps(data))
        except:
            self._ws = None

    def dump(self):
        return {
            'id': self._id,
            'name': self._name,
            'status': self._status,
            'size': self._size,
        }
