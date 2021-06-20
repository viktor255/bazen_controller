// wiringpi start
var wiringpi = require('wiringpi-node');

function setUpPWMOut() {
    // # use 'GPIO naming'
    wiringpi.setup('gpio');

    // # set #18 to be a PWM output
    wiringpi.pinMode(18, wiringpi.PWM_OUTPUT);

    // # set the PWM mode to milliseconds stype
    wiringpi.pwmSetMode(wiringpi.PWM_MODE_MS);

    // # divide down clock
    wiringpi.pwmSetClock(192);
    wiringpi.pwmSetRange(2000);
}

// change pin mode to input - turn off servo
function turnOffPWM() {
    wiringpi.pinMode(18, wiringpi.INPUT);
}

var MIN_ANGLE = 80;
// var MAX_ANGLE = 260; // not currently used, anyway this is max angle value
var ANGLE_TO_PUSH = 145;
var DELAY_PERIOD = 20;
const WAIT_BEFORE_START = 5000;
const PUSH_LENGTH = 2000;
const SHUTDOWN_TIMER = 60000;

var currentAngle = MIN_ANGLE;


function writeNumber(angle) {
    wiringpi.pwmWrite(18, angle);
    currentAngle = angle;
    console.log(angle);
}

function delayedWrite(currentAngle, desiredAngle, positive) {
    // break if desiredAngle has been reached
    if (positive && (currentAngle >= desiredAngle)) return;
    if (!positive && (currentAngle <= desiredAngle)) return;
    setTimeout(function () {
        if (positive)
            currentAngle++;
        else
            currentAngle--;
        // console.log(currentAngle);

        writeNumber(currentAngle);
        // call next() recursively
        delayedWrite(currentAngle, desiredAngle, positive);
    }, DELAY_PERIOD);
}

function writeNumberSlow(angle) {
    setUpPWMOut();
    if (angle > currentAngle) {
        delayedWrite(currentAngle, angle, true, wiringpi);
    } else {
        delayedWrite(currentAngle, angle, false, wiringpi);
    }
    setTimeout(turnOffPWM, DELAY_PERIOD * 200 + 1000);
}

// wiringpi end


// Require child_process
const exec = require('child_process').exec;

// Create shutdown function
function shutdown() {
    console.log(`Shutting down`)
    exec('shutdown +1')
}

function pushButton(pushToON) {
    if (pushToON) {
        writeNumberSlow(ANGLE_TO_PUSH);
        console.log();
        console.log('pushing button to ON, angle:  \t' + ANGLE_TO_PUSH);
    } else {
        writeNumberSlow(MIN_ANGLE);
        console.log();
        console.log('pushing button to OFF, angle:  \t' + MIN_ANGLE);
    }
}

function main() {
    setUpPWMOut();
    writeNumber(MIN_ANGLE);

    setTimeout(() => pushButton(true), WAIT_BEFORE_START);
    setTimeout(() => pushButton(false), WAIT_BEFORE_START + PUSH_LENGTH);

    setTimeout(() => shutdown(), SHUTDOWN_TIMER);
}

main();

