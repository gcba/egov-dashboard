var Config;

;(function(global, document){

    "use strict";

    Config = global.Config = global.Config || {};

    //Create app in google
    Config.ga = {
    	clientId: 'xxxxxxxxxxxxxxxxxxxxxxxxx',
    	apiKey: 'xxxxxxxxxxxxxxxxxxxxxxx',
    	scopes: ['https://www.googleapis.com/auth/analytics', 'https://www.googleapis.com/auth/analytics.readonly'],
    	
    	//To know ids: http://ga-dev-tools.appspot.com/explorer/
    	sites: {
    		'ga:xxxxxxx':{
    			name: 'name',
    			id: 'id'
    		},
            //...
    	}
    };

    Config.baid = {
        servicebaid : 'http://...'
    };

    Config.redmine = {
        service : 'http://...',
        key: 'xxxxxxxxxxxxxxxxxxxxxxxx'
    };

})(window, document);