# -*- coding: utf-8 -*-

import tornado.ioloop
import tornado.web
import random
import json
import datetime
import time


events = []

class EventsHandler(tornado.web.RequestHandler):
    def randomErrorEvent(self):
        return random.choice([
          { "message":"Error provision", "warning":True},
          { "message":"Error al provisionar: Este modelo no soporta TV",
              "warning":True},
          { "message":"Error al provisionar: número de líneas no soportado por el modelo", "warning":True},
            ])

    def randomEvent(self):
        return  random.choice([
          { "message":"Cambio datos Telefonía"},
          { "message":"Cambio de servicio 30Megas, 1 Línea, IPTV a 60Megas, 1 Línea, IPTV"},
          { "message":"Cambio datos GPON"},
          { "message":"Línea 1: Registrada"},
          { "message":"Online alepregpon1 0/1/2/2"},
          { "message":"DHCP lease 192.168.105.164"},
          { "message":"Offline"},
          { "message":"Línea 1: Registrada"},
          { "message":"ACS OK Firmware upgrade"},
          { "message":"Línea 1: Registrada"},
          { "message":"ACS Firmware upgrade requested HG8247T_V200R006C00SPC201_full_all.bin"},
          { "message":"Línea 1: Registrada"},
          { "message":"ACS Boot"}])

    def getNewEvents(self, numEvents, nextId):
        newEvents = []
        now = datetime.datetime.now()
        for num in range(numEvents):
            if num % 25 == 0:
                event = self.randomErrorEvent()
            else:
                event = self.randomEvent()
            event['timestamp'] = to_timestamp(now + datetime.timedelta(1))
            event['id'] = nextId + num
            newEvents.append(event)
        return newEvents

    def get(self):
        if len(events)>0:
            nextId = events[-1]['id'] + 1
        else:
            nextId = 0
        events.extend(self.getNewEvents(50, nextId))
        self.write(json.dumps(events[-50:]))


def to_timestamp(t):
    return time.mktime(t.timetuple()) + (t.microsecond / 1000000.0)



application = tornado.web.Application([
    (r"/events", EventsHandler),
    (r'/(.*)', tornado.web.StaticFileHandler, {'path': './'}),
    ], debug=True)

if __name__ == "__main__":
    application.listen('8888')
    tornado.ioloop.IOLoop.current().start()
