var intervalID;

var normalColor		= "transparent";
var warnColor		= "#FFFF00";
var timerColors		= ['#FFE5BB', '#9FF4B7'];
var resetButtonImg	= ["url('images/resetA.png')", "url('images/resetB.png')"];
var isReset			= true;
var startHour		= [0, 0];
var startMin	   	= [1, 0];
var startSecond		= [0, 0];

var optionTimer		= 0;
var currentTimer	= 0;

var curHour			= 0;
var curMin			= 0;
var curSecond		= 0;

var states = {
	RUNNING : 0,
	STOPPED : 1
}

var totalSeconds;
var currentState;
var warningTime;

var clockFace;
var optionsForm;
var controls;
var timesUp;

// Process pgUP, pgDown, and "Stop" keys from USB remote
function doKeyDown (e) {
	var event = window.event ? window.event : e;
	
	switch (event.keyCode) {
		
		case 32:			// Space
		case 66:			// "b"
			timeClick();
			break;
			
		case 33:			// pgUP
		case 34:			// pgDOWN
			doReset();
			break;
			
		default:
			
	}
}

function initDisplay() {

	clockFace = document.getElementById("clockFace");
	optionForm = document.getElementById("optionsForm");
	controls = document.getElementById("control");
	timesUp = document.getElementById("timesUp");

	totalSeconds = startHour[currentTimer] * 3600 + startMin[currentTimer] * 60 + startSecond[currentTimer];
	currentState = states.STOPPED;
	
	clockFace.style.visibility = "visible";
	
	doReset();
					
}

function setResetImage() {
	document.getElementById("reset").style.backgroundImage = resetButtonImg[currentTimer];
}	


function showTime () {
    
    var seconds = totalSeconds;

    // Update background to provide warning prior to finish
	var newBG = ((seconds <= warningTime)?warnColor:normalColor);
	if (clockFace.style.backgroundColor != newBG) clockFace.style.backgroundColor = newBG

    // Calculate hours/minutes/seconds
    curHour = (seconds < 3600)?0:Math.floor(seconds/3600);
    seconds -= (curHour * 3600);
    curMin = (seconds < 60)?0:Math.floor(seconds/60);
    seconds -= (curMin * 60);
    curSecond = seconds;
    
    // Display current time
    clockFace.innerHTML = ((curHour==0)?"":curHour + ":") + ((curHour==0)?"":(curMin<10)?"0":"") + curMin + ":" + ((curSecond<10)?"0":"") + curSecond;

}

function updateClock() {
	
    totalSeconds--;
    if (totalSeconds <= 0) {
        showTimesUp();
		doStop();
	} else {
    	showTime();
	}

}

function updateControls() {
//     var controls = document.getElementById("control");
	
    if (currentState == states.RUNNING) {
		controls.style.visibility = "hidden";			    	    
    } else {
        controls.style.visibility = "visible";
    }
}

// Shows the option panel
function doOptions(timer) {

	optionTimer = timer;
	hideTimesUp();
	
	clockFace.style.visibility = "hidden";
    optionForm.style.visibility = "visible";
    
    document.getElementById("ok").style.display = "inline-block";
    document.getElementById("cancel").style.display = "inline-block";
    document.getElementById("reset").style.display = "none";
    document.getElementById("optionA").style.display = "none";
    document.getElementById("optionB").style.display = "none";
    
    controls.className = "show";
    
}

function doOK() {

    // Get values from the form fields
    var newHour   = parseInt(document.getElementById("hourInput"  ).value);
    var newMinute = parseInt(document.getElementById("minuteInput").value);
    var newSecond = parseInt(document.getElementById("secondInput").value);
   
	// It's crazy, I know, but this makes sure the values are within range (>=0, <99 for hours, <59 for minutes+seconds)
    newHour 	= (!(newHour) 	|| (newHour<0))   ? 0 : ((newHour  >99) ? 99 : newHour);
    newMinute 	= (!(newMinute) || (newMinute<0)) ? 0 : ((newMinute>59) ? 59 : newMinute);
    newSecond 	= (!(newSecond) || (newSecond<0)) ? 0 : ((newSecond>59) ? 59 : newSecond);

	// Make sure they're not all zero (like, what's the point?). And, set the new timer times
//     if ((newHour + newMinute + newSecond) != 0) {
    currentTimer = optionTimer;
	startHour[currentTimer] 	= newHour;
	startMin[currentTimer]		= newMinute;
	startSecond[currentTimer]	= newSecond;
	isReset = false;
// 	}

    // Finally, reset the clock to the potentially new values
    doReset();
	doCancel();

}

function doCancel() {
    
    hideTimesUp();
    
    clockFace.style.visibility = "visible";
    optionForm.style.visibility = "hidden";
        controls.className = "hide";

    document.getElementById("ok").style.display = "none";
    document.getElementById("cancel").style.display = "none";
    document.getElementById("reset").style.display = "inline-block";
    document.getElementById("optionA").style.display = "inline-block";
    document.getElementById("optionB").style.display = "inline-block";
    
    var h = document.getElementById("hourInput"); h.value = '';
	var m = document.getElementById("minuteInput"); m.value = '';
	var s = document.getElementById("secondInput"); s.value = '';

}

function doRun() {
	isReset = false;
	if (clockFace.style.visibility == "visible") {		        
        intervalID = setInterval (updateClock, 1000);
        currentState = states.RUNNING;
        updateControls();
    }
}

function doStop() {
    if (clockFace.style.visibility == "visible") {
    	clearInterval (intervalID);
    	currentState = states.STOPPED;
    	updateControls();			        
    }
}

function resetTime() {
	
	// Only toggle timers if the next timer is valid
	if (isSetNextTimer()) {
		if (isReset) {
			nextTimer();
		}
	}
	
	isReset = true;
	setResetImage ();
	totalSeconds = startHour[currentTimer] * 3600 + startMin[currentTimer] * 60 + startSecond[currentTimer];
	setWarningTime();
	showTime();	

}

function setWarningTime() {
	if (totalSeconds >= 240) {
		warningTime = 60;
	} else if (totalSeconds >= 120) {
		warningTime = 30;
	} else if (totalSeconds >= 40) {
		warningTime = 10;
	} else if (totalSeconds >= 10) {
		warningTime = 5;
	} else {
		warningTime = 2;
	}
}

function doReset() {
	hideTimesUp();
	resetTime();
}

function timeClick() {
    if ((currentState == states.STOPPED) & (totalSeconds <= 0)) {
        autoReset();
    } else {
        if (currentState == states.RUNNING) {
	        doStop();
        } else {
	        doRun();
        }
	}
}

function hideTimesUp() {
    timesUp.style.visibility = "hidden";
}

function showTimesUp() {
	timesUp.style.visibility = "visible";
}

function autoReset() {
	isReset = true;
	hideTimesUp();
	resetTime();
}

function nextTimer() {
	currentTimer = returnNextTimer();
}

function isSetNextTimer() {
	var n = returnNextTimer();
	return ((startHour[n] != 0) || (startMin[n] != 0) || (startSecond[n] != 0))
}

function returnNextTimer() {
	return 1 - currentTimer;
}