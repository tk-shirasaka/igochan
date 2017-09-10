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
        elif 'view' in data:
            self.status = 1
            search_by_name(data['view']).group.append(self)
        elif 'request' in data:
            self.status = random.randint(2, 3)
            self.opponent = search_by_name(data['request'])
            self.group = self.opponent.group
            self.history = self.opponent.history
            self.group.append(self)
            self.group.append(self.opponent)
            self.opponent.next(self.status)
            self.opponent.opponent = self
        elif 'index' in data:
            self.next(self.status)
            self.opponent.next(self.status)
            self.history.append(data['index'])

    def next(self, status):
        self.status = (status - 1) % 2 + 2

    def reset(self):
        self.status = 0
        self.opponent = None
        self.group = []
        self.history = []

    def dump(self):
        return {
            'name': self.name,
            'status': self.status,
        }
