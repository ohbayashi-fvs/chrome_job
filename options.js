function save_options() {
  const morningStart = document.getElementById("morning-start").value;
  const eveningStart = document.getElementById("evening-start").value;
  const debug = document.getElementById("debug").checked;
  chrome.storage.sync.set(
    {
      morningStart,
      eveningStart,
      debug,
    },
    function () {
      // Update status to let user know options were saved.
      window.close();
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get().then((items) => {
    document.getElementById("morning-start").value = items.morningStart;
    document.getElementById("evening-start").value = items.eveningStart;
    document.getElementById("debug").checked = items.debug;
  });
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
