var EVENTS = {};


(function(ns){
  ns.createPresenter = function(eventsService, eventsView, warningsView, filtersView) {
    var filters = {};
    var render = function () {
          eventsView.render(eventsService.findAll());
          warningsView.render(eventsService.findAllWarningEvents());
          filtersView.render(filters, eventsService.availableFilters(), function (property, selected) {
            filters[property] = selected;
            console.log("CALLBACK FILTERSVIEW", filters);
            //debugger;
          });
    }

    eventsService.onUpdate(function () {
      render();
    });

    return {
      displayEvents: function(){
        render();
      },
    };
  };


  ns.createEventsService = function(url) {
    var events = [];
    var warningEvents = [];
    var availableFields = {};

    var onUpdateCallback = null;

    function updateAvailableFields() {
      fields = {};
      for (i=0; i< events.length; i++){
        for (var property in events[i]) {
          if (property === "message" || property === "id" || property === "timestamp" || property === "warning")
            continue;
          if (! fields[property]) {
            fields[property] = [];
          }
          if ( fields[property].indexOf(events[i][property]) == -1 ) {
            fields[property].push(events[i][property]);
          }
        }
      }
      availableFields = fields;
    };

    function filter(events, filters) {
      filters = filters || {};
      var result = events.filter(function(e){
        for (var filter_property in filters) {
          if (e[filter_property] !== filters[filter_property]) {
            return false;
          }
        }
        return true;
      });
      return result;
    };

    function updateDataFromServer(){
      $.get(url, {}, function(data){
          events = JSON.parse(data);
          warningEvents = events.filter(function(e){ return e.warning == true});
          updateAvailableFields();
          onUpdateCallback && onUpdateCallback();
        });
    };

    updateDataFromServer();
    setInterval(updateDataFromServer, 20000);

    return {
      availableFilters: function() {
        return availableFields;
      },
      findAll: function(filters) {
        return filter(events, filters);
      },
      findAllWarningEvents: function(filters) {
        return filter(warningEvents, filters);
      },
      onUpdate: function(callback){
        onUpdateCallback = callback;
      },
    };
  };
}(EVENTS));


