var background = chrome.extension.getBackgroundPage();

var contentTabId;

// auto refresh the tab
function ReloadTab(){ 
	chrome.tabs.query({active: true}, function(tabs) {		
		chrome.tabs.query({}, function(tabs) {						 
      chrome.tabs.reload(tabs[0].id)
		})
  });
}

// get the time interval from popup.html
function getTime(){
  chrome.runtime.onMessage.addListener(function(msg,sender) {
    
    if (msg.from == "popup") {  //got message from popup
      default_time = msg.first;
      default_time = Number(default_time);
      time = default_time;
    }
  });
}

var default_time = 60;
var time = default_time;

// main function
function Run(){ 

  if (time>0){
    time = time-1;
    getTime(default_time, time);
  }
  else{
    ReloadTab();
    time = default_time;
  }
}

// start the extension
setInterval(function() {Run(default_time,time)}, (1000));

