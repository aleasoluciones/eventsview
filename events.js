var EVENTS = {};


(function(ns){
  ns.createPresenter = function(eventsService, eventsView, warningsView, filtersView) {

    var filters = {};

    filtersView.onFilterSelected(function (property, selected) {
      filters[property] = selected;
      render();
    });

    filtersView.onFilterDeleted(function (property) {
      delete filters[property];
      render();
    });

    function renderEvents(){
      eventsView.render(eventsService.findAll(filters));
      warningsView.render(eventsService.findAllWarningEvents(filters));
    }

    function render() {
          renderEvents();
          filtersView.render(filters, eventsService.availableFilters(filters));
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


  ns.createEventsService = function(url, fieldNames) {
    var events = [];
    var warningEvents = [];

    var onUpdateCallback = null;

    function updateAvailableFields(events) {
      var fields = {};
      for (var i=0; i< events.length; i++){
        for (var fieldIndex=0; fieldIndex < fieldNames.length; fieldIndex++){
          var field = fieldNames[fieldIndex];
          var event_field_value = events[i][field];

          if (! fields[field]) {
            fields[field] = [];
          }

          if (event_field_value) {
            if ( fields[field].indexOf(event_field_value) == -1 ) {
                fields[field].push(event_field_value);
            }
          }
        }
      }
      return fields;
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
          onUpdateCallback && onUpdateCallback();
        });
    };

    updateDataFromServer();
    setInterval(updateDataFromServer, 5000);

    return {
      availableFilters: function(filters) {
        return updateAvailableFields(events);
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
    var onFilterDeletedCallback;
    var onFilterSelectedCallback;


    var previousAvailableFilters = {};

    return {
      onFilterDeleted: function(callback){ onFilterDeletedCallback = callback; },
      onFilterSelected: function(callback){ onFilterSelectedCallback = callback; },
      render: function (filters, availableFilters){
        if (JSON.stringify(availableFilters) === JSON.stringify(previousAvailableFilters)) {
          return;
        }
        previousAvailableFilters = availableFilters;

        filtersform.empty();

        filters = filters || {};
        availableFilters = availableFilters || {};
        for (var property in availableFilters) {
            var label = $('<label/>', {for: property});
            label.text(property);
            label.css( {"margin-left":"10px", "margin-right":"5px", "width":"50px"});
            var select = $('<select/>', {id: property});
            select.css( {"width":"100px"} );
            select.append('<option value="*">*</option>');
            for (i=0; i< availableFilters[property].length; i++){
                var option = $('<option>', {value: availableFilters[property][i]});
                option.text(availableFilters[property][i]);
                if (filters[property] === availableFilters[property][i]) {
                  option.attr('selected', 'selected');
                }
                select.append(option);
            }
            select.change(function(e){
                property = $(e.target).attr('id');
                selected = $(e.target).val();
                if( selected === "*" ) {
                  onFilterDeletedCallback && onFilterDeletedCallback(property);
                } else {
                  onFilterSelectedCallback && onFilterSelectedCallback(property, selected);
                }
            });
            filtersform.append(label);
            filtersform.append(select);
        }
      }
    }
  }
}(EVENTS));


