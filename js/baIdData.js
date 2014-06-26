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
            registered:ko.observable(),
            users_now:ko.observable(),
            complete:ko.observable()
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
            BAIdData.bindings.baid.users_now(data.users);
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
