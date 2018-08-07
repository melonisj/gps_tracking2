var dataIn;
var path = [];
var old_altitude = null;
var old_velocity = null;
var accel_threshold = 1;
var falling_threshold = 40;
var status = 0;
var begin_time;
var burn_end_time;
var peak = false;
var max_velocity = 0;
var data_count;

function updateGPGGA(){
  // console.log(dataIn);
  rocketSeconds = dataIn.time % 100;
  rocketMinutes = (dataIn.time % 10000)-rocketSeconds;
  rocketHours = (dataIn.time-rocketMinutes - rocketSeconds) / 10000;
  rocketMinutes = (rocketMinutes < 10) ? "0" + rocketMinutes : rocketMinutes;
  document.getElementById("dataTable_cell_position_status").innerHTML = dataIn.gpsQuality;
  document.getElementById("dataTable_cell_altitude").innerHTML = dataIn.altitude + " " +dataIn.altUnit;
  document.getElementById("dataTable_cell_latitude").innerHTML = dataIn.lat.toFixed(4) + " " + dataIn.latInd;
  document.getElementById("dataTable_cell_longitude").innerHTML = dataIn.long.toFixed(4) + " " + dataIn.longInd;
  document.getElementById("dataTable_cell_time").innerHTML = rocketHours + ":" + rocketMinutes + ":" + Math.round(rocketSeconds);
  document.getElementById("dataTable_cell_satellites").innerHTML = dataIn.satsUsed;
  document.getElementById("dataTable_cell_upward_velocity").innerHTML = Math.round(dataIn.velocity) + " " + dataIn.altUnit + "/s";
  // if(data_count > 20){
      generateMap();
      // data_count = 0;
  // }
  // if(data_count % 20 > 19){
      rocketStatus();
  // }
  // data_count = data_count + 1;
}


function updateGPGSA(){

}

function list_check(id){

  if(document.getElementById(id).style.getPropertyValue("text-decoration") === "line-through"){
    document.getElementById(id).style.setProperty("text-decoration", "none");
    document.getElementById(id).style.color = "#a7a1a1";
  } else {
    document.getElementById(id).style.color = "#676767";
    document.getElementById(id).style.setProperty("text-decoration", "line-through");
}
}

function updateGPVTG(){
  // console.log(dataIn);
  document.getElementById("dataTable_cell_direction").innerHTML = dataIn.direction + " &deg";
  document.getElementById("dataTable_cell_lateral_speed").innerHTML = dataIn.kmhSpeed + " km/h";


}

function rocketStatus(){
  var climbing = (dataIn.altitude - old_altitude) > 0;
  var accelerating = (dataIn.velocity - old_velocity) > 0;
  if(old_altitude !== null && old_velocity !== null){
    if(!climbing && !peak){
      peak = true;
      document.getElementById("peak_height_cell").innerHTML = old_altitude + " " + dataIn.altUnit + "/s";
    }
    if(accelerating && dataIn.velocity > max_velocity){
      max_velocity = dataIn.velocity;
      document.getElementById("max_velocity_cell").innerHTML = max_velocity.toFixed(2) + " " + dataIn.altUnit + "/s";
    }
    if(status !== "Prelaunch"  && dataIn.velocity === 0){
      status = "Landed";
      document.getElementById("total_flight_time_cell").innerHTML = (parseFloat(dataIn.time) - begin_time).toFixed(3) + " s";
    }
    if(status === "Descending" && parseFloat(dataIn.velocity)*-1 < falling_threshold){
      status = "Parachute Deployed";
    }
    if(status === "Engine Combustion" && accelerating === false && climbing === true){
      status = "Engine Burnout";
      burn_end_time = parseFloat(dataIn.time);
      document.getElementById("engine_burn_time_cell").innerHTML = (burn_end_time-begin_time).toFixed(3) + " s";
    }
    if(climbing && status === "Prelaunch"){
      //accelerating
      status = "Engine Combustion";
      begin_time = parseFloat(dataIn.time);
    } else if (status === "Engine Burnout" && !climbing){
      //falling
      status = "Descending";
    }
  } else {
    status = "Prelaunch";
  }
  old_altitude = dataIn.altitude;
  old_velocity = dataIn.velocity;
  //pre-launch 0
  //engine combustion 1
  //engine burnout 2
  //decending 3
  //parachute deployed 4
  //landed 5
  document.getElementById("dataTable_cell_status").innerHTML = status;
  document.getElementById("status_image").src = 'images/' + status + '.png';
}

function generateMap(){
  var temp_position = [dataIn.lat, dataIn.long];
  path = path.concat([temp_position]);


  var map = new GMaps({
    el: '#map',
    lat: temp_position[0],
    lng: temp_position[1]
  });
  map.removeMarkers();
  map.addMarker({
    lat: temp_position[0],
    lng: temp_position[1],
    title: 'Rocket',
    click: function(e) {
      alert('This is where the rocket is');
    }
  });
// path = [[-12.044012922866312, -77.02470665341184], [-12.05449279282314, -77.03024273281858], [-12.055122327623378, -77.03039293652341], [-12.075917129727586, -77.02764635449216], [-12.07635776902266, -77.02792530422971], [-12.076819390363665, -77.02893381481931], [-12.088527520066453, -77.0241058385925], [-12.090814532191756, -77.02271108990476]];

if(path.length > 0){
  console.log(path);
  map.drawPolyline({
    path: path,
    strokeColor: '#a40505',
    strokeOpacity: 0.6,
    strokeWeight: 6
  });
}
}

function socSetup() {
    console.log('attempting to connect websocket.');
    soc = new WebSocket('ws://127.0.0.1:1880/ws/gpsData');
    soc.onopen = function () {
        soc.send('{"Begin": \"requestSignal\"}');
        console.log('websocket opened');
    };
    soc.onmessage = function (p1) {
        console.log('data received over websocket');
        //console.log(p1.data)
		//		pageUpdate(p1.data);
				updatePage(p1.data);
    };

    soc.onclose = function (p1) {
        console.log('websocket closing');
        setTimeout(socSetup, 10000);
    };

    soc.onerror = function (event) {
        console.log('websocket error: ' + event.data);
        setTimeout(socSetup, 10000);
    };
}

function updatePage(json){
	try {
	} catch (e) {
		console.log(e.message);
	}
	if(json){
    dataIn= JSON.parse(json);
    console.log(dataIn);
    switch (dataIn.dataType){
      case ("$GPGGA"):
        updateGPGGA();
        break;
      case("$GPGSA"):
        updateGPGSA();
        break;
      case("$GPVTG"):
        updateGPVTG();
        break;
      case("Error"):
        handleErrors();
        break;
      default:
        console.log("Improper Format");
        dataIn = {};
        break;
    }
	}
}

window.onload = function () {
  console.log("Page Loaded");
  //UNCOMMENT THIS LITTLE BASTARD TO ENABLE WEBSOCKET
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
