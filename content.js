const getTimefromStr = (timeStr, isTomorrow) => {
  const now = new Date();
  const timeArray = timeStr.split(":");
  const hour = Number(timeArray[0]);
  const mins = Number(timeArray[1]);
  const time = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + (isTomorrow ? 1 : 0),
    hour,
    mins,
    1
  );
  return time.getTime();
};

export const getMorningTime = (morningStart, isTomorrow) => {
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

export const eveningAlarmReflesh = (isTomorrow) => {
  chrome.storage.sync.get().then((items) => {
    if (!items.morningStart) return;
    isScheduledTomorrow("evening").then((result) => {
      if (result) return;
      chrome.alarms.clear("evening");
      chrome.alarms.create("evening", {
        when: getTimefromStr(
          items.todayTime === "" ? items.eveningStart : items.todayTime,
          isTomorrow
        ),
      });
      /*
      chrome.alarms
        .get("evening")
        .then((alarm) => console.log(alarm.name + new Date(alarm.scheduledTime)));
        */
    });
  });
};
