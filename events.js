var EVENTS = {};


(function(ns){
  ns.createPresenter = function(eventsRepository, eventView, warningView) {
    var render = function () {
          eventView.render(eventsRepository.findAll());
          warningView.render(eventsRepository.findAllWarningEvents());
    }

    eventsRepository.onUpdate(function () {
      render();
    });

    return {
      displayEvents: function(){
        render();
      },
    };
  };
  ns.createAjaxRepository = function(url) {
    var events = [];
    var warningEvents = [];

    var onUpdateCallback = null;

    setInterval(function(){
        $.get(url, {}, function(data){
          events = JSON.parse(data);
          warningEvents = events.filter(function(e){ return e.warning == true});
          onUpdateCallback && onUpdateCallback();
        });
    }, 6000);

    return {
      findAll: function() {
        return events;
      },
      findAllWarningEvents: function() {
        return warningEvents;
      },
      onUpdate: function(callback){
        onUpdateCallback = callback;
      },
    };
  };
}(EVENTS));


