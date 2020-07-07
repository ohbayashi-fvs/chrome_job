document.getElementById("send").onclick = function() {
    chrome.runtime.sendMessage({  //send a message to the background script
      from: "popup",
      first: document.getElementById("time").value,
    });
}