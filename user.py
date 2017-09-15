import random

users = set()

def search_by_websocket(ws):
    return [user for user in users if user.ws == ws].pop()

def search_by_name(name):
    user = [user for user in users if user.name == name and name != '']
    return None if len(user) == 0 else user.pop()

class User:
    def __init__(self, ws):
        self.ws = ws
        self.name = None
        self.reset()

    def set(self, data):
        if 'name' in data:
            if search_by_name(data['name']) == None:
                self.name = data['name']
        if 'view' in data:
            self.status = 1
            search_by_name(data['view']).group.append(self)
        if 'request' in data:
            self.status = random.randint(2, 3)
            self.opponent = search_by_name(data['request'])
            self.group = self.opponent.group
            self.history = self.opponent.history
            self.agehama = self.opponent.agehama
            self.group.append(self)
            self.group.append(self.opponent)
            self.opponent.next(self.status)
            self.opponent.opponent = self
        if 'index' in data:
            self.next(self.status)
            self.opponent.next(self.status)
            self.history.append(data['index'])
        if 'agehama' in data and len(data['agehama']) > 0:
            index = len(self.history) - 1
            self.agehama[index] = data['agehama']
        if 'reconnect' in data:
            user = search_by_name(data['reconnect'])
            if user:
                user.ws = self.ws
                users.remove(self)
            else:
                self.name = data['reconnect']
        if 'close' in data:
            self.name = None

    def next(self, status):
        self.status = (status - 1) % 2 + 2

    def reset(self):
        self.status = 0
        self.opponent = None
        self.group = []
        self.history = []
        self.agehama = {}

    def dump(self):
        return {
            'name': self.name,
            'status': self.status,
        }
