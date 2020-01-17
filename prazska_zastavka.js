/* global Module */

/* Magic Mirror
 * Module: WeatherForecast
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("prazska_zastavka",{

//https://maps.googleapis.com/maps/api/directions/json?origin=Nuselské%20schody&destination=I.P.Pavlova&key=YOUR_API_KEY

    defaults: {
        url: "https://ext.crws.cz/api/ABCz/departures?from=", //this.config.feeds
        animationSpeed: 2.5 * 1000,
        reloadInterval: 3600000,
        updateInterval: 15000,
        initialLoadDelay: 500,
        retryDelay: 25000,
        my_stop: "Nuselské schody",
        dir1: "Trams to I.P.Pavlova:",
        dir2: "Trams to Otakarova:",
        destination2_11: "Spořilov",
        destination2_6: "Kubánské náměstí",
        strTime1min: "< 1 min",
        strTimemin: " min",
    },

	// Default module config.

  scheduleItems: {dir1: [], dir2: []}, 
	// create a variable for the first upcoming calendaar event. Used if no location is specified.
	firstEvent: false,


	// Define required scripts.
	getScripts: function() {
		return ["request-promise-native.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["prazska_zastavka.css"];
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.scheduleItems = {dir1: [], dir2: []};
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

	},

    // Override socket notification handler.
    socketNotificationReceived: function(notification, payload) {
//      var self = this;
            if (notification === "SCHEDULE_ITEMS") {
                    this.processSchedule(payload.data, this);
                    this.updateDom(self.config.animationSpeed);
/*
                    if (!this.loaded) {
                            this.scheduleUpdateInterval();
                    }

                    this.loaded = true;
*/
            }
    },  
  
  
	// Override dom generator.
	getDom: function() {
      Log.log("getDOM start");
      var wrapper = document.createElement("div");

      console.log(this.scheduleItems);
    
    if (this.scheduleItems.dir1.length > 0) {
      Log.log("items exists");

      var title1 = document.createElement("div");
      title1.innerHTML = this.config.dir1;
      title1.className = "bright small light";
      wrapper.appendChild(title1);

      var table1 = document.createElement("table");

      for (i=0; i < this.scheduleItems.dir1.length && i < 5; i++) {
Log.log(this.scheduleItems.dir1[i]);
//console.log(this.scheduleItems.dir1[i]);

          var tramTime = this.scheduleItems.dir1[i][1];
          var strDiff = this.getStringTimeDiff(tramTime);
/*
          if (strDiff == this.config.strTime1min) {
            this.scheduleItems.dir1.pop();
            continue;
          }
*/
          var dateRow = document.createElement("tr");
          var dateCell = document.createElement("td");
          dateCell.className = "bright medium light";
          dateCell.innerHTML = this.scheduleItems.dir1[i][0];
          dateRow.appendChild(dateCell);

          dateCell = document.createElement("td");
          dateCell.innerHTML = strDiff ;
          dateCell.className = "bright medium light";
          dateRow.appendChild(dateCell);
          
          dateCell = document.createElement("td");
          dateCell.innerHTML = tramTime.getHours()+":"+tramTime.getMinutes();
                    
          dateCell.className = "bright medium light";
          dateRow.appendChild(dateCell);

          table1.appendChild(dateRow);
          wrapper.appendChild(table1);
      }      

      var table2 = document.createElement("table");
      
      for (i=0; i < this.scheduleItems.dir2.length && i < 5; i++) {


          var tramTime = this.scheduleItems.dir1[i][1];
          var strDiff = this.getStringTimeDiff(tramTime);
/*
          if (strDiff == this.config.strTime1min) {
            this.scheduleItems.dir2.pop();
            continue;
          }
*/
          var dateRow = document.createElement("tr");
          var dateCell = document.createElement("td");
          dateCell.className = "bright medium light";
          dateCell.innerHTML = this.scheduleItems.dir2[i][0];
          
          
          
          dateRow.appendChild(dateCell);

          dateCell = document.createElement("td");
          dateCell.innerHTML = strDiff ;
          dateCell.className = "bright medium light";
          dateRow.appendChild(dateCell);
          
          dateCell = document.createElement("td");
          dateCell.innerHTML = tramTime.getHours()+":"+tramTime.getMinutes();
          dateCell.className = "bright medium light";
          dateRow.appendChild(dateCell);

          table2.appendChild(dateRow);
          wrapper.appendChild(table2);
      }      

      
    } else {
      this.scheduleUpdate(this.config.retryDelay);
      
    }
    
    return wrapper;
	},


	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processSchedule: function(data) {
    var schedule = JSON.parse(data);
    for (i=0; i < schedule.trains.length; i++) {
      Log.log("schedule.trains[i].dateTime1 " + schedule.trains[i].dateTime1);
      
      var tramTime = new Date(schedule.trains[i].dateTime1.replace(/(\d+).(\d+).(\d+)/, "$3/$2/$1"));
      
        if ( ( schedule.trains[i].train.num1 == 6 && schedule.trains[i].stationTrainEnd.name ==  this.config.destination2_6 ) ||  ( schedule.trains[i].train.num1 == 11 && schedule.trains[i].stationTrainEnd.name == this.config.destination2_11 )  ) { // NBS||Otakarova
            this.scheduleItems.dir2.push ([schedule.trains[i].train.num1, tramTime]);
        } else {
            this.scheduleItems.dir1.push ([schedule.trains[i].train.num1, tramTime]);
        }

    }
  
  
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

    getStringTimeDiff: function (time) {
      var timeNow= new Date();
       var strDiff = "";
        var diffMs = time - timeNow;
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        
        if (diffMins < 1) {
        strDiff = this.config.strTime1min;
        } else {
        strDiff = Math.floor(diffMins) +  this.config.strTimemin;
        }
      return strDiff;
    },
  
	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
  scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
//			self.updateSchedule();
		Log.log("GET_SCHEDULE");
		      self.sendSocketNotification("GET_SCHEDULE", {
	            config: self.config
	          });
		}, nextLoad);
	}

});
