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
    var fields = {};

    var onUpdateCallback = null;

    setInterval(function(){
        $.get(url, {}, function(data){
          events = JSON.parse(data);
          warningEvents = events.filter(function(e){ return e.warning == true});

          fields = {};
          for (i=0; i< events.length; i++){
            for (var property in events[i]) {

              if (property === "message" || property === "id" || property === "timestamp")
                continue;

              if (! fields[property]) {
                fields[property] = [];
              }

              if ( fields[property].indexOf(events[i][property]) == -1 ) {
                 fields[property].push(events[i][property]);
              }
            }
          }
          console.log("EFA", fields);

          onUpdateCallback && onUpdateCallback();
        });
    }, 2000);

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


