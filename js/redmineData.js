var RedmineData;

;(function(global, document, $, ko, gapi, Config, _){

    "use strict";

    //Fix strange bug using jquery2 and bootstrap3
    HTMLDivElement.prototype.remove = function(){};

    RedmineData = global.RedmineData = global.RedmineData || {};

    RedmineData.refreshTime = 10*60*1000;    

    RedmineData.timerId = null;

    RedmineData.lastMonthDate = undefined;

    RedmineData.tempRawData = [];

    RedmineData.bindingsUser = {
        date: ko.observable(),
        nestedUsers: ko.observable({}),
        users : {
            top: ko.observableArray([])
        }
    };

    RedmineData.bindings = {
        date: ko.observable(),
        rawData: ko.observableArray([]),
        hours : {
            day:'',
            week:'',
            month:''
        },
        users : {
            top: ''
        }
    };

    RedmineData.init = function () {
        ko.applyBindings(RedmineData.bindings,document.getElementById("redmine-hours"));
        ko.applyBindings(RedmineData.bindingsUser,document.getElementById("redmine-top-users"));
        this.startCarousel();
        this.lastMonthDate = this.getLastMonth(this.getToday());
        var that = this;
        this.getData();
        this.timerId = setInterval(function(){
            that.lastMonthDate = that.getLastMonth(that.getToday());
            RedmineData.tempRawData = [];
            that.getData();
        },this.refreshTime);
    };

    RedmineData.getData = function (offset) {

        if(!offset){
            offset = 0;
        }

        var that =  this;

        $.getJSON(Config.redmine.service+'/time_entries.json?key='+Config.redmine.key+'&sort=spent_on:desc&limit=100&offset='+offset+'&callback=?',function(data){

            var lastInfo = data.time_entries[data.time_entries.length-1];
            RedmineData.tempRawData = RedmineData.tempRawData.concat(data.time_entries);

            if(that.lastMonthDate<new Date(lastInfo.spent_on)){
                that.getData(offset+100);
            } else {
                that.calculate();
            }

        });

    };    

    RedmineData.calculate = function(date){
        RedmineData.bindings.rawData(RedmineData.tempRawData);
        RedmineData.bindingsUser.nestedUsers(_.groupBy(RedmineData.bindings.rawData(),function(item){return item.user.id;}));
        $('#redmine-top-users').carousel({
          interval: 5000
        });
        RedmineData.bindingsUser.date(new Date());
        RedmineData.bindings.date(new Date());
    };

    RedmineData.getTotal = function(array, date){
        var total = 0;
        $.each(array,function(i,e){
            if(new Date(e.spent_on)>date){
                total += parseFloat(e.hours);
            } else {
                return false;          
            }
        });
        return Math.round(total);
    };

    RedmineData.getToday = function(){
        var newdate = new Date();
        newdate.setHours(0);
        newdate.setMinutes(0);
        newdate.setSeconds(0);
        return newdate;
    };

    RedmineData.getLastMonth = function(date){
        var newdate = new Date(date);
        newdate.setMonth(newdate.getMonth() - 1);
        return new Date(newdate);
    };

    RedmineData.startCarousel = function(){
        $('#redmine-hours').carousel({
          interval: 4000
        });
    };

    RedmineData.bindings.hours.day = ko.computed(function() {
                    var newdate = RedmineData.getToday();
                    newdate.setDate(newdate.getDate() - 1);
                    return RedmineData.getTotal(this.rawData(),new Date(newdate));
                },  RedmineData.bindings);

    RedmineData.bindings.hours.week = ko.computed(function() {
                    var newdate = RedmineData.getToday();
                    newdate.setDate(newdate.getDate() - 7);
                    return RedmineData.getTotal(this.rawData(),new Date(newdate));
                },  RedmineData.bindings);

    RedmineData.bindings.hours.month = ko.computed(function() {
                    var newdate = RedmineData.getToday();
                    newdate.setDate(1);
                    return RedmineData.getTotal(this.rawData(),new Date(newdate));
                },  RedmineData.bindings);

    RedmineData.bindingsUser.users.top = ko.computed(function() {
                    var newdate = RedmineData.getToday();
                    newdate.setDate(newdate.getDate() - 7);
                    var top = [];
                    _.each(this.nestedUsers(),function(times,id){
                        var total = _.reduce(times,function(memo,obj){
                            if(Date(newdate)<new Date(obj.spent_on)){
                                return memo;
                            } else {
                                return memo + obj.hours;
                            }
                        },0);
                        top.push({'user':times[0].user,'total':parseInt(total)});
                    });

                    top = _.sortBy(top, function(data){ return data.total*-1; });

                    top = top.slice(0,5);

                    return top;
                },  RedmineData.bindingsUser);

})(window, document,jQuery, ko, gapi, Config, _);
