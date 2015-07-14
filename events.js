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
  ns.createRepository = function() {

    function randomErrorEvent() {
      var events = [
          { message:"Error provision", warning:true},
          { message:"Error al provisionar: Este modelo no soporta TV", warning:true},
          { message:"Error al provisionar: número de líneas no soportado por el modelo", warning:true},
      ];
      var eventIndex = parseInt(Math.random() * events.length)
      return events[eventIndex];
    }

    function randomEvent() {
      var events = [
          { message:"Cambio datos Telefonía"},
          { message:"Cambio de servicio 30Megas, 1 Línea, IPTV a 60Megas, 1 Línea, IPTV"},
          { message:"Cambio datos GPON"},
          { message:"Línea 1: Registrada"},
          { message:"Online alepregpon1 0/1/2/2"},
          { message:"DHCP lease 192.168.105.164"},
          { message:"Offline"},
          { message:"Línea 1: Registrada"},
          { message:"ACS OK Firmware upgrade"},
          { message:"Línea 1: Registrada"},
          { message:"ACS Firmware upgrade requested HG8247T_V200R006C00SPC201_full_all.bin"},
          { message:"Línea 1: Registrada"},
          { message:"ACS Boot"}
      ];
      var eventIndex = parseInt(Math.random() * events.length)
      return events[eventIndex];
    }

    function getEvents(numEvents) {
        var now = new Date().getTime();
        var result = [];
        for (var i = 0; i < numEvents; i++) {
            if ( i % 25 == 0 ) {
                var event = randomErrorEvent()
                event.message = i + " - " + event.message;
            } else {
                 var event = randomEvent();
                 event.message = i + " - " + event.message;
            }
            event.timestamp = now + i;
            result.push(event);
        }
        return result;
    }


    var events = getEvents(20);
    var warningEvents = events.filter(function(e) { return e.warning == true})
    var onUpdateCallback = null;

    setInterval(function(){
        events = events.concat(getEvents(10));
        warningEvents = events.filter(function(e) { return e.warning == true});
        onUpdateCallback && onUpdateCallback();
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


