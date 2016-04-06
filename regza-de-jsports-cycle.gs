// TOSHIBA REGZA DBR-M590 Jスポサイクル初回放送番組を録画予約
// http://www.toshiba-living.jp/manual.pdf?no=89247&fw=1&pid=17487

var email = "regza@example.jp"; // REGZAの定期チェック先メアド
var password = "パスワード"; // REGZAメール予約パスワード

function regzaReservation() {
  
  var payload =
  {
  "genre" : "12", //自転車
  "broad_kbn[]" : "2", //初回放送（生放送＋録画初回放送）
  };

  var options =
  {
    "method" : "post",
    "payload" : payload
  };
   
  var response = UrlFetchApp.fetch("http://www.jsports.co.jp/search/sys/program/", options);

  //日時の抽出
  //<td class="timeschedule">04月09日（土）<br />
  //午後09:00 - 午後09:30</td>

  var myRegexp = /<td class="timeschedule">([0-9]+)月([0-9]+)日.*<br \/>\n(午前|午後|深夜)([0-9]+):([0-9]+) - (午前|午後|深夜)([0-9]+):([0-9]+)<\/td>/i;
  var match = myRegexp.exec(response.getContentText("EUC-JP"));
  var month = match[1];
  var day = match[2];
  var startAmPm = match[3];
  var startHours = match[4];
  if ( startAmPm == "午後" ) {
    startHours = String(Number(startHours) + 12)
  }
  var startMinuts = match[5];
  var endAmPm = match[6];
  var endHours = match[7];
  if ( endAmPm == "午後" ) {
    endHours = String(Number(endHours) + 12)
  }
  var endMinuts = match[8];
  Logger.log(month);
  Logger.log(day);
  Logger.log(startAmPm);
  Logger.log(startHours);
  Logger.log(startMinuts);
  Logger.log(endAmPm);
  Logger.log(endHours);
  Logger.log(endMinuts);
  
  //チャンネルの抽出
  //<th abbr="J SPORTS 3" axis="J SPORTS 3" scope="row" class="channelLabel">
  
  var myRegexp = /<th abbr="(J SPORTS [1234])" axis="(J SPORTS [1234])" scope="row" class="channelLabel">/i;
  var match = myRegexp.exec(response.getContentText("EUC-JP"));
  var channel;
  switch (match[1]) {
  case "J SPORTS 1":
    channel = "BS242";
    break;
  case "J SPORTS 2":
    channel = "BS243";
    break;
  case "J SPORTS 3":
    channel = "BS244";
    break;
  case "J SPORTS 4":
    channel = "BS245";
    break;
  }
  Logger.log(channel);

  var year = Utilities.formatDate(new Date(), "JST-9", "YYYY");
  Logger.log(year);

  //open パスワード prog add 20160409 2100 2130 BS244
  var order = "open " + password + " prog add " + year + month + day + " " +
              startHours + startMinuts + " " +
              endHours + endMinuts + " " +
              channel + " AF U1 EY";
  Logger.log(order);
  
  MailApp.sendEmail(email, "J Sports Cycle*" + year, order);
}

function regzaList() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog list l d e9");
}

function regzaRemain() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog remain");
}
