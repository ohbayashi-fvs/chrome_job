const save = () => {
  const todayTime = document.getElementById("today-time").value;
  if (!todayTime) {
    return;
  }
  if (todayTime === "") {
    return;
  }
  if (Number(todayTime.slice(0, 2)) < 12) {
    document.getElementById("error").textContent = "終業時間は12時以降にしてください";
    return;
  }

  chrome.storage.sync
    .set({
      todayTime: document.getElementById("today-time").value,
    })
    .then(
      setTimeout(() => {
        getTime();
        document.getElementById("error").textContent = "設定しました";
        setTimeout(() => {
          window.close();
        }, 900);
      }, 100)
    );
};

document.getElementById("save").onclick = () => {
  save();
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
