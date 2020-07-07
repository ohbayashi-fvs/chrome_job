function openNewTab () {
	chrome.tabs.query({active: true}, function(tabs) {		
		chrome.tabs.query({}, function(tabs) {						 
			chrome.tabs.reload(tabs[0].id)
		})
	});
}

var time = 100000;

setInterval(function() {openNewTab()}, time);


//var intervalo = setInterval(openNewTab(), time);
//setTimeout(function() {openNewTab()}, clearInterval(), document.onclick());
//document.onClick(clearInterval());

