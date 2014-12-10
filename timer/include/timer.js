var intervalID;

var timerColors		= ['#FFE5BB', '#9FF4B7'];
var resetButtonImg	= ["url('images/resetA.png')", "url('images/resetB.png')"];
var isReset			= false;
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

var clockFace;
var optionsForm;
var controls;

function initDisplay() {

	clockFace = document.getElementById("clockFace");
	optionForm = document.getElementById("optionsForm");
	controls = document.getElementById("control")

	totalSeconds = startHour[currentTimer] * 3600 + startMin[currentTimer] * 60 + startSecond[currentTimer];
	currentState = states.STOPPED;
	
	clockFace.style.visibility = "visible";
	
	doReset();
					
}

function setResetImage() {
	document.getElementById("reset").style.backgroundImage = resetButtonImg[currentTimer];
}	


function showTime () {
    
    // Calculate hours/minutes/seconds
    var seconds = totalSeconds;
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
        document.getElementById("timesUp").style.visibility = "visible";
		doStop();
		// resetTime();       
    } else {
        showTime();
    }
}

function updateControls() {
    var controls = document.getElementById("control");
	
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
    var newHour   = document.getElementById("hourInput"  ).value;
    var newMinute = document.getElementById("minuteInput").value;
    var newSecond = document.getElementById("secondInput").value;
    
	// It's crazy, I know, but this makes sure the values are within range (>=0, <99 for hours, <59 for minutes+seconds)
    newHour 	= (isNaN(newHour) 	|| (newHour<0))   ? 0 : ((newHour  >99) ? 99 : newHour);
    newMinute 	= (isNaN(newMinute) || (newMinute<0)) ? 0 : ((newMinute>59) ? 59 : newMinute);
    newSecond 	= (isNaN(newSecond) || (newSecond<0)) ? 0 : ((newSecond>59) ? 59 : newSecond);

	// Make sure they're not all zero (like, what's the point?). And, set the new timer times
//     if ((newHour + newMinute + newSecond) != 0) {
    	startHour[optionTimer] 		= newHour;
    	startMin[optionTimer]		= newMinute;
		startSecond[optionTimer]	= newSecond;
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
		} else {
			isReset = true;
		}
	}
	
	totalSeconds = startHour[currentTimer] * 3600 + startMin[currentTimer] * 60 + startSecond[currentTimer];
	showTime();
}

function doReset() {
	hideTimesUp();
	resetTime();
	setResetImage ();
}

function timeClick() {
    if ((currentState == states.STOPPED) & (totalSeconds <= 0)) {
        doReset();
    } else {
        if (currentState == states.RUNNING) {
	        doStop();
        } else {
	        doRun();
        }
	}
}

function hideTimesUp() {
    document.getElementById("timesUp").style.visibility = "hidden";
}

function autoReset() {
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