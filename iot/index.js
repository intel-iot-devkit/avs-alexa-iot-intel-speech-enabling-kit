var awsIoT = require("aws-iot-device-sdk");
var mraa = require("mraa");
var grove = require("jsupm_grove");

var thingShadows = awsIoT.thingShadow({
  keyPath   : "PATH_TO_KEY",
  certPath  : "PATH_TO_CERT",
  caPath    : "PATH_TO_CA",
  clientId  : "CLIENT_ID",
  host      : "ENDPOINT"
});

var thing = 'NAME_OF_THING';
var firmataOffset = 512; //pin number offset when using MRAA over Firmata SubPlatform
var tempSensorPin = 0; //port A0 on Grove Shield
var ledPin = 4; //port D4 on Grove Shield
var serialPort = '/dev/ttyACM0';

var clientTokenUpdate;
var temperature = 0; //temperature reading
var ledState = 0; //LED state

mraa.addSubplatform(mraa.GENERIC_FIRMATA, serialPort);
var tempSensor = new grove.GroveTemp(firmataOffset+tempSensorPin);
var led = new mraa.Gpio(firmataOffset+ledPin);
led.dir(mraa.DIR_OUT);

thingShadows.on("connect", function(){
  console.log("Connected!");

  //register shadow
  thingShadows.register(thing, {}, function(){
    var thingState = {"state":{"desired":{"state":ledState,"temperature":temperature}}};
    clientTokenUpdate = thingShadows.update(thing, thingState);
    if(clientTokenUpdate === null){
      console.log("Update Failed!");
    }
  });

  //update temperature data every 5 seconds
  setInterval(function(){
    temperature = Math.round(tempSensor.value());
    thingState = {"state":{"desired":{"state":ledState,"temperature":temperature}}};
    clientTokenUpdate = thingShadows.update(thing, thingState);
      if(clientTokenUpdate === null){
        console.log("Update Failed!");
    }
  },5000);
});

thingShadows.on('status', function(thingName, stat, clientToken, stateObject){
  console.log('received '+stat+' on '+thingName+': '+JSON.stringify(stateObject));
});

thingShadows.on('delta', function(thingName, stateObject){
  //update the LED state
  state = stateObject.state.state;
  led.write(state);
});
