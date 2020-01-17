/* Magic Mirror
 * Node Helper: Prazska zastavka
 *
 * By Petr Zagvazdin
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	// Subclass start method.
	start: function() {
		console.log("Starting module: " + this.name);
		this.fetcher = false;
	},

	
	// Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "GET_SCHEDULE") {
			this.updateSchedule(payload.config);
			return;
		}
	},

	updateSchedule: function(config) {

		var url = config.url + encodeURIComponent(config.my_stop);
		var self = this;
		var retry = true;
		const request = require('request-promise-native');
		
		const exec = async (url) => {
		  const response = await request({
			method: 'GET',
			uri: url
//			json: true
		  });
		  console.log('GET');
			self.sendSocketNotification("SCHEDULE_ITEMS", {
						data: response
			});
		}
		
		exec(url);
		
		/*
const request = require('request-promise-native')
const from = 'Nuselské schody'
const url = 'https://ext.crws.cz/api/ABCz/departures?from=' + encodeURIComponent(from)

const exec = async (url) => {
  const response = await request({
    method: 'GET',
    uri: url,
    json: true
  })

  console.log(response)
}

exec(url)		
		
		*/
		

/*
		var apiRequest = require("xmlhttprequest").XMLHttpRequest;

//		var apiRequest = new XMLHttpRequest();
		apiRequest.open("GET", url, true);
		apiRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					//self.processSchedule(JSON.parse(this.response));
					self.sendSocketNotification("SCHEDULE_ITEMS", {
								data: this.response
					});

				} else {
					Log.error(self.name + ": Could not load schedule.");
				}

//				if (retry) {
//					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
//				}
			}
		};
		apiRequest.send();
		*/
	} 
	
});
