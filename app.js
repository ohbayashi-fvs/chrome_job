const getTimefromStr = (timeStr, isTomorrow, isEvening) => {
  const now = new Date();
  const timeArray = timeStr.split(":");
  const hour = Number(timeArray[0]);
  const mins = Number(timeArray[1]);
  const isMorning = now.getHours() <= 11;
  const isMorningTommorowEvening = isMorning && isTomorrow && isEvening; //休み明けで夜タイマーが朝動いたとき
  const time = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + (!isTomorrow || isMorningTommorowEvening ? 0 : 1),
    hour,
    mins,
    1
  );
  return time.getTime();
};

const getMorningTime = (morningStart, isTomorrow) => {
  if (isTomorrow) {
    return getTimefromStr(morningStart, true);
  }
  const now = new Date();
  if (isOver(morningStart)) {
    return now.setSeconds(now.getSeconds() + 3);
  } else {
    return getTimefromStr(morningStart);
  }
};

const eveningAlarmReflesh = (isTomorrow, reflesh) => {
  chrome.storage.sync.get().then((items) => {
    if (!items.morningStart) return;
    isScheduledTomorrow("evening").then((result) => {
      if (result && !reflesh) return;
      chrome.alarms.clear("evening");
      chrome.alarms.create("evening", {
        when: getTimefromStr(
          items.todayTime === "" || isTomorrow ? items.eveningStart : items.todayTime,
          isTomorrow,
          true
        ),
      });
      debugConsole("evening");
    });
  });
};

const isScheduledTomorrow = async (alarmName) => {
  return await chrome.alarms.get(alarmName).then((alarm) => {
    if (!alarm) return false;
    return alarm.scheduledTime - Date.now() > 1000 * 60 * 60 * 5;
  });
};

const morningAlarmReflesh = (isTomorrow) => {
  chrome.storage.sync.get().then((items) => {
    if (!items.morningStart) return;
    if (
      isScheduledTomorrow("morning").then((result) => {
        if (result) return;
        chrome.alarms.clear("morning");
        chrome.alarms.create("morning", {
          when: getMorningTime(items.morningStart, isTomorrow),
        });
        debugConsole("morning");
      })
    )
      return;
  });
};

chrome.storage.sync.get().then((items) => {
  if (!items.morningStart) {
    chrome.storage.sync.set({
      todayTime: "",
      morningStart: "08:50",
      eveningStart: "18:00",
      debug: false,
    });
  } else {
    morningAlarmReflesh();
    eveningAlarmReflesh();
  }
});

chrome.storage.onChanged.addListener(() => {
  chrome.alarms.clear("morning");
  chrome.alarms.clear("evening");
  morningAlarmReflesh(true);
  eveningAlarmReflesh(false, true);
});

export const isOver = (TimeStr, advance) => {
  const now = new Date();
  if (advance) {
    now.setMinutes(now.getMinutes() + advance + 0.5);
  }
  const nowHours = now.getHours();
  const nowMins = now.getMinutes();
  const timeArray = TimeStr.split(":");
  const hour = Number(timeArray[0]);
  const mins = Number(timeArray[1]);
  if (nowHours > hour) return true;
  if (nowHours === hour) return nowMins >= mins;
  return false;
};

const callJobkan = async () => {
  chrome.notifications.create({
    title: "ジョブカンお知らせ",
    message: "打刻してください",
    iconUrl: "icon.png",
    type: "basic",
  });

  const result = await chrome.tabs.query({ url: "https://*.jobcan.jp/*" });
  if (result.length >= 4) return;
  chrome.tabs.create({ url: "https://id.jobcan.jp/users/sign_in" });
};

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "morning") {
    callJobkan();
    morningAlarmReflesh(true);
  }
  if (alarm.name === "evening") {
    callJobkan();
    eveningAlarmReflesh(true);
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (
    info.status === "complete" &&
    tab.url.indexOf("https://id.jobcan.jp/account/profile") !== -1
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        document.getElementsByClassName("jbc-app-link")[0].click();
        chrome.tabs.remove(tabId);
      },
    });
  }
  if (info.status === "complete" && tab.url.indexOf("https://ssl.jobcan.jp/employee") !== -1) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const timerId = setInterval(() => {
          const status = document.getElementById("working_status");
          if (status) {
            clearInterval(timerId);
            const nowHour = new Date().getHours();
            const statusStr = status.textContent;
            if (statusStr === "勤務中" && nowHour >= 15) {
              document.getElementById("adit-button-work-start").style.opacity = 0.2;
            }
            if (statusStr === "未出勤" && nowHour <= 13) {
              document.getElementById("adit-button-work-end").style.opacity = 0.2;
            }
            if (statusStr === "退室中") {
              document.getElementById("adit-button-work-start").style.opacity = 0.2;
              document.getElementById("adit-button-work-end").style.opacity = 0.2;
            }
            document.getElementById("adit-button-rest-start").style.visibility = "hidden";
            document.getElementById("adit-button-rest-end").style.visibility = "hidden";
          }
          if (counter > 20) {
            clearInterval(timerId);
          }
        }, 100);
      },
    });
  }
  if (
    info.status === "complete" &&
    tab.url.indexOf("https://ssl.jobcan.jp/employee/holiday/new") !== -1
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        alert("分単位の申請は今の所NGです。時間単位で申請してください。");
      },
    });
  }
});

const debugConsole = (consoleStr) => {
  chrome.storage.sync.get().then((items) => {
    if (items.debug) {
      if (consoleStr === "morning" || consoleStr === "evening") {
        chrome.alarms.get(consoleStr).then((alarm) => {
          console.log("↓" + consoleStr);
          console.log(new Date(alarm.scheduledTime));
        });
      } else {
        chrome.alarms.getAll().then((alarms) => {
          console.log("↓" + consoleStr);
          alarms.map((alarm) => console.log(alarm.name + new Date(alarm.scheduledTime)));
        });
      }
    }
  });
};

debugConsole("initial");
