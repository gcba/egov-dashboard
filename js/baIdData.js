var BAIdData;

;(function(global, document, $, ko, gapi, Config){

    "use strict";

    //Fix strange bug using jquery2 and bootstrap3
    HTMLDivElement.prototype.remove = function(){};

    BAIdData = global.BAIdData = global.BAIdData || {};

    BAIdData.refreshTime = 10*60*1000;    

    BAIdData.timerId = null;

    BAIdData.bindings = {
        date: ko.observable(),
        loading: ko.observable(true),
        baid : {
            registered:ko.observable(2),
            active:ko.observable(3),
            complete:ko.observable(4)
        }
    };

    BAIdData.init = function () {
        ko.applyBindings(BAIdData.bindings,document.getElementById("ba-id"));
        BAIdData.startCarousel();
        var that = this;
        this.getData();
        BAIdData.timerId = setInterval(function(){that.getData();},BAIdData.refreshTime);
    };

    BAIdData.getData = function () {
        BAIdData.bindings.loading(true);
        $.getJSON(Config.baid.servicebaid+'?callback=?',function(data){
            BAIdData.bindings.loading(false);
            BAIdData.bindings.baid.registered(data.registration);
            BAIdData.bindings.baid.active(data.users);
            BAIdData.bindings.baid.complete(data.profile);
            BAIdData.bindings.date(new Date());
        });

    };    

    BAIdData.startCarousel = function(){
        $('#ba-id').carousel({
          interval: 7000
        });
    };

})(window, document,jQuery, ko, gapi, Config);
