# -*- coding: utf-8 -*-

import tornado.ioloop
import tornado.web
import random
import json
import datetime
import time
import data



def to_timestamp(t):
    return time.mktime(t.timetuple()) + (t.microsecond / 1000000.0)

events = []
now = datetime.datetime.now()
for idx,e in enumerate(data.events):
    e["id"] = idx
    e['timestamp'] = to_timestamp(now + datetime.timedelta(1))
    events.append(e)

offset=0
last_access = to_timestamp(now)
events_to_send=[]

class EventsHandler(tornado.web.RequestHandler):
    def get(self):
        global offset
        now = to_timestamp(datetime.datetime.now())
        num_events = int(now-last_access)
        events_to_send.extend(events[offset:offset+num_events])
        self.write(json.dumps(events_to_send))
        offset=len(events_to_send)
        last_acces = now

application = tornado.web.Application([
    (r"/events", EventsHandler),
    (r'/(.*)', tornado.web.StaticFileHandler, {'path': './'}),
    ], debug=True)

if __name__ == "__main__":
    application.listen('8888')
    tornado.ioloop.IOLoop.current().start()
