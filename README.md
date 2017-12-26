## What Is It?

With your AVS enabled device, you can create Alexa Skills that let's you interact with hardware devices, such as reading sensor data or activating a relay, all with the command of your voice!

## How It Works

An Alexa skill converts spoken commands into computing functions, which are defined as an AWS Lambda. The computing functions can be used to communicate with your IoT device using AWS IoT features.

## Components

### Hardware
1. AVS Device (Rasberry Pi + Intel Speech Enabling Kit)
2. Sensors/Actuators (Arduino 101 + Grove Starter Kit)

### Software
1. Alexa Voice Service (brings voice capabilities to your device)
2. Alexa Skills Kit (defines the voice interaction model e.g. intents & utterances)
3. AWS Lambda (compute functions that execute on defined voice commands)
4. AWS IoT (provides channel to communicate with your IoT device)
5. MRAA/UPM (hardware abstraction library for reading/writing to sensors/actuators)


## Steps

### 1. Setup your Intel Speech Enabling Kit 
* Follow this [tutorial](https://avs-dvk-workshop.github.io) to setup your Intel Speech Enabling Kit with AVS

### 2. Connect sensors/actuators and setup MRAA & UPM
1. Plug in an Arduino 101 to your main computer and upload the StandardFirmata sketch
2. Attach a Grove Shield to the Arduino 101.
  * Attach a temperature sensor to the A0 port
  * Attach an LED to the D4 port (can also be a relay)
3. Plug the Arduino 101 into your Raspberry Pi running AVS
4. Install MRAA & UPM
    * `npm install -g mraa`
    * `npm install -g jsupm_grove`
    * Note: Make sure you have all dependencies are resolved, such as node-gyp, nodejs-dev, build-essential. etc.
5. Identify the serial port where the Arduino 101 is connected (usually /dev/ttyACM0)
6. Try some MRAA/UPM code samples to make sure you are able to interact with the Arduino 101

### 3. Connect your device to AWS IoT
1. We want to send temperature data to AWS IoT so our Lambda function could access it. First, we need to create a new AWS IoT 'Thing'. Follow this [tutorial](http://docs.aws.amazon.com/iot/latest/developerguide/register-device.html) for details.
2. With the newly created 'Thing', copy over the certificates and keys to your Raspberry Pi.
3. Run '/iot/index.js' and check on the AWS IoT dashboard to ensure the data is being updated

### 4. Create an Alexa Skill
1. Go to [](https://developer.amazon.com/edw/home.html#/skill/create/) to create a new Alexa Skill.
2. Fill in the Interaction Model details with the data under `/skill/` e.g. IntentSchema.json, SampleUtterances, Slots
3. Save your progress and resume later. You can complete the rest of the configuration after you've created a Lambda endpoint

### 5. Connect your Alexa Skill to an AWS Lambda
1. Create a new Lambda function [](http://docs.aws.amazon.com/lambda/latest/dg/get-started-create-function.html)
2. Select 'Alexa Skills Kit' as a trigger
3. Upload the Lambda function code
    1. Under `/lambda` run `npm install` to install the node_modules
    2. Zip all the files by running `npm run zip`
    3. Upload the output file `index.zip` to your Lambda and save
4. Test your Lambda with the Alexa Skill with the Service Simulator e.g. Enter "What's the Temperature" as an example utterance

## 6. Try out your skill!
1. Start the data collection script `node /iot/index.js`
2. Start your skill by saying 'Alexa, open NAME_OF_SKILL'
3. Ask it "What's the temperature?" to get the temperature sensor data
4. Say "Turn On" to turn on the connected LED
5. Enjoy!

### Troubleshooting Tips
* Ensure your security policies have the right permissions
* Enable AWSIoTFullAccess for your Lambda Execution Role
