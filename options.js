function save_options() {
  const morningStart = document.getElementById("morning-start").value;
  const eveningStart = document.getElementById("evening-start").value;
  const kadouhyou = document.getElementById("kadouhyou").value;
  const debug = document.getElementById("debug").checked;
  chrome.storage.sync.set(
    {
      morningStart,
      eveningStart,
      kadouhyou,
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
    document.getElementById("kadouhyou").value =
      items.kadouhyou === undefined
        ? "https://docs.google.com/spreadsheets/d/1qiHvpCmoyzHf7mj1SikkO9UWMTswKp-eJNxwuxzcm8E/edit#gid=808721572"
        : items.kadouhyou;
    document.getElementById("debug").checked = items.debug;
  });
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
