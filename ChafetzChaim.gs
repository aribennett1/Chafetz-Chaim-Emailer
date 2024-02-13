function createTrigger() {
  var success = false;
  const today = new Date();
  while (!success) {
    try {
      ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));  
      const tomorrowAtTenThirtyPM = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 22, 30, 0);
      ScriptApp.newTrigger('createTrigger').timeBased().at(tomorrowAtTenThirtyPM).create();
      success = true;
    }
    catch(err) {
      Logger.log(`Error ${err}, sleeping 3 seconds then trying again...`);
      Utilities.sleep(3000);
    }
  }  
  sendNextAudioFile(today);
}

function sendNextAudioFile(currentDate) { 
  var body = ""; 
 
  if (currentDate.getDay() === 5) {
    Logger.log("Tomorrow is Shabbos, exiting...")
    return;
  }

  const tomorrowHebrewDate = getHebrewDate(addDays(currentDate, 1));
  Logger.log(tomorrowHebrewDate.get("Day"), tomorrowHebrewDate.get("Month"), tomorrowHebrewDate.get("DayOfWeek"))
  if (getYomTovName(tomorrowHebrewDate) != "regular day") {
    Logger.log(`Tomorrow is ${tomorrowHebrewDate.get("Day")} ${tomorrowHebrewDate.get("Month")}, exiting...`);
    return;
  }   

  if (PropertiesService.getScriptProperties().getProperty("lastDaySent") == currentDate.getDay()) {
    Logger.log("Shiur was sent for today, exiting...");
    return; //this should be "continue" when testing! (not "return")
  }
  else {
    PropertiesService.getScriptProperties().setProperty("lastDaySent", currentDate.getDay());  
    Logger.log("lastDaySent: " + PropertiesService.getScriptProperties().getProperty("lastDaySent"));
  }
  
  var lastSentFileName = PropertiesService.getScriptProperties().getProperty('lastSentFileName');
  const folder = DriveApp.getFolderById("1qB2Ffr4thmyphW5I_KNjojTMsMwX7Lot");
  var nextFileName = getNextFileName(lastSentFileName);
  Logger.log(nextFileName);        
  const file = folder.getFilesByName(nextFileName).next();
  var attachments = [file];
  if (nextFileName == "CC77.3gp" || nextFileName == "CC85.3gp" || nextFileName == "CC115.3gp" || nextFileName == "CC119.3gp") {
    attachments.push(folder.getFilesByName("7 conditions of toeles.jpg").next());
  }
    
  const subject = `${formatDate(currentDate)}'s Chafetz Chaim`;

  if (nextFileName == "CC136.3gp") {
    body += `MAZEL TOV!!! <br />Here are the stats: There were 4 hours, 12 minutes and 27 seconds of recordings spread out over 136 days.<br />`;
    nextFileName = "CC0.3gp"
  }

  var name = getYomTovName(getHebrewDate(addDays(currentDate, 2)))
  var name2 = "regular day";
  if (currentDate.getDay() == 4) {name2 = getYomTovName(getHebrewDate(addDays(currentDate, 3)));}
  if (name != "regular day" || name2 != "regular day") {
    body += `The next shiur will be sent ${name != "regular day" ? name : name2}`;
  } 
       
    GmailApp.sendEmail("aris-chafetz-chaim@googlegroups.com", subject, "", {
      name: "Chafetz Chaim",
      htmlBody: body,
      attachments: attachments
    });
    Logger.log(`Sent ${subject}. ${body}, ${attachments}`);
    Logger.log(`RemainingDailyQuota: ${MailApp.getRemainingDailyQuota()}`);
    PropertiesService.getScriptProperties().setProperty('lastSentFileName', nextFileName);
} 

function getNextFileName(lastSentFileName) {  
  var numberPart = parseInt(lastSentFileName.match(/\d+/)[0]);
  return lastSentFileName.replace(numberPart, numberPart + 1);
}

function formatDate(date) {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return days[(date.getDay() + 1) % 7];
}

function getYomTovName(hebrewDate) {
    const month = hebrewDate.get("Month");
    const day = hebrewDate.get("Day");

    if ((month == "Tishrei" && (day == 1 || day == 2))) {
        return "after Rosh Hashana";
    } else if (month == "Tishrei" && day == 10) {
        return "after Yom Kippur";
    } else if (
        (month == "Tishrei" && (day == 15 || day == 16)) ||        
        (month == "Nissan" && (day == 15 || day == 16))        
    ) {
        return "on Chol HaMoed";
    } else if (        
        (month == "Tishrei" && (day == 22 || day == 23)) ||
        (month == "Nissan" && (day == 21 || day == 22))
    ) {
        return "after Yom Tov";
    } else if (month == "Sivan" && (day == 6 || day == 7)) {
        return "after Shavuos";
    } else if ((month == "Av" && day == 9) || (month == "Av" && day == 10 && hebrewDate.get("DayOfWeek") == 0)) {
        return "after Tisha B'Av";
    } else {
        return "regular day";
    }
}

function getHebrewDate(d) {
  const year = d.getFullYear();
  const month = `${(d.getMonth() + 1)}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  var hebcal = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`).getContentText());
  const hebrewDate = new Map();
  hebrewDate.set("DayOfWeek", d.getDay());
  hebrewDate.set("Month", hebcal.hm.replaceAll("Nisan", "Nissan").replaceAll("Iyyar", "Iyar").replaceAll("Tevet", "Teves").replaceAll("Sh'vat", "Shvat"));
  hebrewDate.set("Day", hebcal.hd);
  return hebrewDate;  
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
