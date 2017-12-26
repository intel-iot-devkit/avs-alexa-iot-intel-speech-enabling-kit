//AWS IoT Config

var config = {};
config.IOT_SENSOR_BROKER_ENDPOINT        = "THING_ENDPOINT";
config.IOT_SENSOR_BROKER_REGION          = "THING_REGION";
config.IOT_SENSOR_THING_NAME             = "THING_NAME";

//Skill Messages
var SkillMessages = {
    'welcome'               : 'welcome.  you can ask for the temperature reading and state of your coffee machine',
    'metricresponse'        : 'you asked for information about',
    'temperatureresponse'   : 'the temperature is',
    'stateresponse'         : 'the state is now',
    'help'                  : 'you can say things like, whats the temperature, or turn on',
    'cancel'                : 'goodbye',
    'stop'                  : 'goodbye'
};


//Alexa Skill
var Alexa = require('alexa-sdk');
var states = {
    STARTCYCLE  : '_STARTCYCLE',
    ENDCYCLE    : '_ENDCYCLE'
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    var locale = event.request.locale;
    console.log('locale is set to ' + locale);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var promptQueue =[];

var handlers = {
    'LaunchRequest': function (){
        this.handler.state = states.INTRO;
        promptQueue.length = 0;
        this.emit(':ask', SkillMessages.welcome, 'try again');
    },

    'QueryIntent': function (){
        var say;
        var metric = this.event.request.intent.slots.metric.value;

        if (metric == null) { // no slot
            say = SkillMessages.help;
        }

        promptQueue.push(say);
        
        var lastSensorData;

        getSensorShadow(result => {
            lastSensorData = result;
            
            if (lastSensorData == null) {
                say = SkillMessages.help;
            } else {
                switch(metric) {
                    //get temperature data
                    case "temperature":
                        say = SkillMessages.temperatureresponse + ' ' + lastSensorData.temperature + ' degrees';
                        break;
                    //set LED state to ON
                    case "on":
                        say = SkillMessages.stateresponse + ' ' + 'on';
                        updateShadow({"state":1}, status => {});
                        break;
                    //set LED state to OFF
                    case "off":
                        say = SkillMessages.stateresponse + ' ' + 'off';
                        updateShadow({"state":0}, status => {});
                        break;                        
                    default:
                }
            }
            promptQueue.push(say);
            this.emit('SynthesizeAnswerIntent');
        });

    },

    'SynthesizeAnswerIntent': function () {
        var outputMessage = [];
        outputMessage = promptQueue.slice();
        promptQueue.length = 0;
        this.handler.state = states.SYNTHESIZE_ANSWER;
        this.emit(':ask', outputMessage.join(" "));
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', SkillMessages.help, SkillMessages.help);

    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', SkillMessages.stop, SkillMessages.stop);

    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', SkillMessages.cancel, SkillMessages.cancel);

    },

};


// AWS IoT Shadow Helper Functions
function updateShadow(desiredState, callback) {

    var AWS = require('aws-sdk');
    AWS.config.region = config.IOT_SENSOR_BROKER_REGION;

    var paramsUpdate = {
        "thingName" : config.IOT_SENSOR_THING_NAME,
        "payload" : JSON.stringify(
            { "state":
                { "desired": desiredState
                }
            }
        )
    };

    var iotData = new AWS.IotData({endpoint: config.IOT_SENSOR_BROKER_ENDPOINT});

    iotData.updateThingShadow(paramsUpdate, function(error, data){
        if(error){
            console.log(error);
            callback("An error occured.");
        }
        else{
            callback("Update success!");
        }
    });
}

function getSensorShadow(callback) {

    var AWS = require('aws-sdk');
    AWS.config.region = config.IOT_SENSOR_BROKER_REGION;

    var iotData = new AWS.IotData({endpoint: config.IOT_SENSOR_BROKER_ENDPOINT});

    var paramsGet = {
        thingName: config.IOT_SENSOR_THING_NAME
    };

    iotData.getThingShadow(paramsGet, function(error, data){
        if(error){
            console.log(error);
            callback("An error occured.");
        }
        else{
            var sensorObject = JSON.parse(data.payload).state.desired;
            callback(sensorObject);
        }
    });
}
