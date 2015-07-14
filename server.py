import tornado.ioloop
import tornado.web


class EventsHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('hello')



application = tornado.web.Application([
    (r"/events", EventsHandler),
    (r'/(.*)', tornado.web.StaticFileHandler, {'path': './'}),
    ], debug=True)

if __name__ == "__main__":
    application.listen('8888')
    tornado.ioloop.IOLoop.current().start()
