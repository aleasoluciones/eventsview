var EVENTS = {};


(function(ns){
  ns.createPresenter = function(eventsService, eventsView, warningsView, filtersView) {

    function renderEvents(){
      eventsView.render(eventsService.findAll(filters));
      warningsView.render(eventsService.findAllWarningEvents(filters));
    }

    var filters = {};
    var render = function () {
          renderEvents();
          filtersView.render(filters, eventsService.availableFilters(),
            function (property, selected) {
                filters[property] = selected;
                console.log("CALLBACK FILTERSVIEW", filters);
                renderEvents();
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

  ns.createEventsView = function (eventsul ) {
    return {
      render: function (events){
        events.sort(function(e1, e2) { return e2.id - e1.id; });
        eventsul.empty();

        for (var i=0; i< events.length; i++){
            var liNode = $('<li>', {id: events[i].id});
            liNode.text(events[i].id + " " + events[i].timestamp +  " " + events[i].message);
            eventsul.append(liNode);
        }
      }
    }
  }

  ns.createWarningsView = function (warningsul) {
    return {
      render: function (warnings){
        warnings.sort(function(e1, e2) { return e2.id - e1.id; });
        warningsul.empty();

        for (var i=0; i< warnings.length; i++){
            var liNode = $('<li>');
            var href = $('<a>', {href: "#"+warnings[i].id});
            href.text(warnings[i].id + " " + warnings[i].message);
            liNode.append(href);
            warningsul.append(liNode);
        }
      }
    }
  }

  ns.createFiltersView = function (filtersform) {
    return {
      render: function (filters, availableFilters, selectsHandler){
        filtersform.empty();

        filters = filters || {};
        availableFilters = availableFilters || {};
        for (var property in availableFilters) {
            var label = $('<label/>', {for: property});
            label.text(property);
            label.css( {"margin-left":"10px", "margin-right":"5px"});
            var select = $('<select/>', {id: property, selected: "NA"});
            for (i=0; i< availableFilters[property].length; i++){
                select.append('<option value="' + availableFilters[property][i] + '">' + availableFilters[property][i] + '</option>');
            }
            select.append('<option value="NA">*</option>');
            select.change(function(e){
                property = $(e.target).attr('id');
                selected = $(e.target).val();
                selectsHandler(property, selected);
            });
            filtersform.append(label);
            filtersform.append(select);
        }
      }
    }
  }
}(EVENTS));


