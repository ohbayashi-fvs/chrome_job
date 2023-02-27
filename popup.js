const save = () => {
  window.close();
};

document.getElementById("save").onclick = () => {
  chrome.storage.sync
    .set({
      todayTime: document.getElementById("today-time").value,
    })
    .then(setTimeout(() => getTime(), 100));
};

const keypress = (event) => {
  if (event.key === "Enter") {
    save();
  }
};

document.addEventListener("keypress", keypress);

const getTime = async () => {
  const alarm = await chrome.alarms.get("evening");
  const date = new Date(alarm.scheduledTime);
  const now = new Date();
  const dayStr = date.getDate() - now.getDate() === 0 ? "今日" : "明日";
  const str =
    dayStr + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
  document.getElementById("evening").textContent = str;
};

getTime();
