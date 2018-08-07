var dataIn;


function updateGPGGA(){

}


function updateGPGSA(){

}


function updateGPVTG(){

}


function socSetup() {
    console.log('attempting to connect websocket.');
    soc = new WebSocket('ws://127.0.0.1:1880/ws/gpslocator');
    soc.onopen = function () {
        soc.send('{"Begin": \"requestSignal\"}');
        console.log('websocket opened');
    };
    soc.onmessage = function (p1) {
        console.log('data received over websocket');
        //console.log(p1.data)
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
