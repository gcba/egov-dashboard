var AnalyticsData;

;(function(global, document, $, ko, gapi, Config){

    "use strict";

    //Fix strange bug using jquery2 and bootstrap3
    HTMLDivElement.prototype.remove = function(){};

    AnalyticsData = global.AnalyticsData = global.AnalyticsData || {};

    AnalyticsData.bindings = {
        ga : {
            loading: ko.observable(true),
            date: ko.observable(),
            realtime:ko.observableArray(0),
            contents:ko.observableArray(0)
        }
    };

    AnalyticsData.refreshTime = 10*60*1000;    

    AnalyticsData.timerId = null;

    AnalyticsData.RealTimeModel = function(data,qty){
        this.name = ko.observable(data.name);
        this.id = ko.observable(data.id);
        this.qty = ko.observable(qty);
        return this;
    };

    AnalyticsData.PathModel = function(data,paths){
        this.name = ko.observable(data.name);
        this.id = ko.observable(data.id);
        this.paths = ko.observableArray(paths);
        return this;
    };

    AnalyticsData.init = function () {
        gapi.client.setApiKey(Config.ga.apiKey);
        var that = this;
        window.setTimeout(function(){that.checkAuth();},1);
        ko.applyBindings(AnalyticsData.bindings,document.getElementById("realtime-visitors"));
        //ko.applyBindings(AnalyticsData.bindings,document.getElementById("top-paths-today"));
    };

    AnalyticsData.checkAuth = function() {
        var that = this;
        gapi.auth.authorize({client_id:Config.ga.clientId, scope: Config.ga.scopes, immediate: true}, function(authResult){that.handleAuthResult(authResult);});
    };

    AnalyticsData.handleAuthResult = function(authResult) {
        var authorizeButton = document.getElementById('authorize-button');
        if (authResult && !authResult.error) {
            authorizeButton.style.display = 'none';
            this.makeApiCall();
            var that = this;
            this.queryAccounts()
            AnalyticsData.timerId = setInterval(function(){that.queryAccounts();},AnalyticsData.refreshTime);
        } else {
            authorizeButton.style.display = 'block';
            authorizeButton.onclick = this.handleAuthClick;
        }
    };

    AnalyticsData.handleAuthClick = function(event) {
        var that = this;
        gapi.auth.authorize({client_id:Config.ga.clientId, scope: Config.ga.scopes, immediate: false}, function(authResult){that.handleAuthResult(authResult);});
        return false;
    };

    AnalyticsData.makeApiCall = function() {
        if(gapi.client.analytics){
            this.queryAccounts();
        }else{
            var that = this;
            gapi.client.load('analytics', 'v3', function() {
              that.queryAccounts();
            });
        }
    };

    AnalyticsData.queryAccounts = function() {
        var that = this;
        AnalyticsData.bindings.ga.loading(true);
        $.each(Config.ga.sites,function(i,e){
            that.getRealTimeVisits(i);
            //that.getTopPagesToday(i);
        });
    };

    AnalyticsData.getRealTimeVisits = function(acc){
        //CHECK THIS http://ga-dev-tools.appspot.com/explorer/
        var that = this;
        gapi.client.analytics.data.realtime.get({
            'ids': acc,
            'metrics': 'rt:activeVisitors'
            }).execute(function(data){
                if(!data.error){
                    AnalyticsData.bindings.ga.loading(false);
                    that.setRealTimeVisits(Config.ga.sites['ga:'+data.profileInfo.profileId],data.result.totalsForAllResults['rt:activeVisitors']);
                    that.startCarousel();
                }
            });
    };

    AnalyticsData.getTopPagesToday = function(acc){
        //CHECK THIS http://ga-dev-tools.appspot.com/explorer/
        var that = this;
        gapi.client.analytics.data.ga.get({
            'ids': acc,
            'start-date': this.today(),
            'dimensions':'ga:pagePath',
            'sort': '-ga:visits',
            'end-date': this.today(),
            'metrics': 'ga:visits',
            'max-results': '5'
            }).execute(function(data){
                if(!data.error){
                    that.setTopPagesToday(Config.ga.sites['ga:'+data.profileInfo.profileId],data.result.rows);
                    that.startCarousel();
                }
            });
    };

    AnalyticsData.setRealTimeVisits = function(data, value){
        var index = null;

        $.each(AnalyticsData.bindings.ga.realtime(), function(i,e){
            if(e.id()===data.id){
                index = i;
                return;
            }
        });
        if(index){
            AnalyticsData.bindings.ga.realtime()[index].qty(value);
        }else{
            AnalyticsData.bindings.ga.realtime.push(new AnalyticsData.RealTimeModel(data,value));
        }
        AnalyticsData.bindings.ga.date(new Date());
    };

    AnalyticsData.setTopPagesToday = function(data, value){
        var index = null;

        $.each(AnalyticsData.bindings.ga.contents(), function(i,e){
            if(e.id()===data.id){
                index = i;
                return;
            }
        });
        if(index){
            AnalyticsData.bindings.ga.contents()[index].paths(value);
        }else{
            AnalyticsData.bindings.ga.contents.push(new AnalyticsData.PathModel(data,value));
        }
    };

    AnalyticsData.startCarousel = function(){
        $('#realtime-visitors').carousel({
          interval: 5000
        });
        $('#top-paths-today').carousel({
          interval: 8000
        });
    };

    AnalyticsData.today = function(){
        var t = new Date();
        return t.getFullYear()+'-'+('0' + (t.getMonth()+1)).slice(-2)+'-'+('0' + t.getDate()).slice(-2);
    };

})(window, document,jQuery, ko, gapi, Config);
