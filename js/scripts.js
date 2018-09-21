var dataIn;
var groundAlt = 0;
var maxAltitude = 0;
var maxVelocity = 0;


function updateGPGGA() {
  document.getElementById("rocket_lat_data_cell").innerHTML = dataIn.lat.toFixed(6) + dataIn.latInd
  document.getElementById("gps_quality_data_cell").innerHTML = dataIn.gpsQuality;
  document.getElementById("rocket_long_data_cell").innerHTML = dataIn.long.toFixed(6) + dataIn.longInd;
  document.getElementById("rocket_altitude_data_cell").innerHTML = dataIn.altitude-groundAlt + " " + dataIn.altUnit;
  if(dataIn.altitude-groundAlt > maxAltitude){
  	maxAltitude = dataIn.altitude-groundAlt;
  	  document.getElementById("rocket_max_altitude_data_cell").innerHTML = dataIn.altitude-groundAlt + " " + dataIn.altUnit;
  }
}


function updateGPGSA() {
  	document.getElementById("sats_used_data_cell").innerHTML = dataIn.satCount;

}


function updateGPVTG() {
  	document.getElementById("rocket_velocity_data_cell").innerHTML = (dataIn.kmhSpeed*0.621371).toFixed(2) + " mph";  	document.getElementById("rocket_velocity_data_cell").innerHTML = (dataIn.kmhSpeed*0.621371).toFixed(2) + " mph";
  	document.getElementById("rocket_heading_data_cell").innerHTML = dataIn.direction + " &deg";
	if(dataIn.kmhSpeed*0.621371 > maxVelocity){
		maxVelocity = dataIn.kmhSpeed*0.621371;
	  	document.getElementById("rocket_max_velocity_data_cell").innerHTML = (dataIn.kmhSpeed*0.621371).toFixed(2) + " mph";
	}
}

function setAltitude() {
	document.getElementById("ground_altitude_data_cell").innerHTML = dataIn.altitude  + " " + dataIn.altUnit;
	groundAlt = dataIn.altitude;

}

function socSetup() {
  console.log('attempting to connect websocket.');
  soc = new WebSocket('ws://192.168.1.10:1880/ws/gpslocator');
  soc.onopen = function() {
    soc.send('{"Begin": \"requestSignal\"}');
    console.log('websocket opened');
  };
  soc.onmessage = function(p1) {
    console.log('data received over websocket');
    //console.log(p1.data)
    updatePage(p1.data);
  };

  soc.onclose = function(p1) {
    console.log('websocket closing');
    setTimeout(socSetup, 10000);
  };

  soc.onerror = function(event) {
    console.log('websocket error: ' + event.data);
    setTimeout(socSetup, 10000);
  };
}

function updatePage(json) {
  try {} catch (e) {
    console.log(e.message);
  }
  if (json) {
    dataIn = JSON.parse(json);
    console.log(dataIn);
    switch (dataIn.dataType) {
      case ("$GPGGA"):
        updateGPGGA();
        break;
      case ("$GPGSA"):
        updateGPGSA();
        break;
      case ("$GPVTG"):
        updateGPVTG();
        break;
      case ("Error"):
        handleErrors();
        break;
      default:
        console.log("Improper Format");
        dataIn = {};
        break;
    }
  }
}

window.onload = function() {
  console.log("Page Loaded");
  socSetup();
  // startTime();
  // setInterval(function(){ calendar(); }, 600000);
  // data = json;
  // forcst();
  // calendar();
  // showCalendar();
  // bplTable()
  // greeting();
  // celebrate();
};
