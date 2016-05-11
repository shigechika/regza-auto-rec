// TOSHIBA REGZA DBR-M590 Jスポサイクル初回放送番組を録画予約
// http://www.toshiba-living.jp/manual.pdf?no=89247&fw=1&pid=17487

var email = "regza@example.jp"; // REGZAの定期チェック先メアド
var password = "パスワード"; // REGZAメール予約パスワード

function regzaReservation() {

  // 時間比較のためにTime値を使う
  var today = new Date();
  Logger.log(today);
  var year = Utilities.formatDate(today, "Asia/Tokyo", "YYYY");
  var todayTime = getDateTime(today);
  Logger.log(todayTime);

  // 予約は直近7日間
  var future = today;
  future.setDate(future.getDate() + 7);
  Logger.log(future);
  var futureTime = getDateTime(future);
  Logger.log(futureTime);

  // JSPORTSホームページ検索条件
  var payload = {
    "genre": "12", //自転車
    "broad_kbn[]": "2", //初回放送（生放送＋録画初回放送）
  };
  var options = {
    "method": "post",
    "payload": payload
  };
  var response = UrlFetchApp.fetch("http://www.jsports.co.jp/search/sys/program/", options);
  var text = response.getContentText("EUC-JP");

  // 日時の抽出
  // <td class="timeschedule">04月09日（土）<br />
  // 午後09:00 - 午後09:30</td>
  var myRegexpDate = /<td class="timeschedule">([0-9]+)月([0-9]+)日.*<br \/>\n(午前|午後|深夜) ?([0-9]+):([0-9]+) - (午前|午後|深夜) ?([0-9]+):([0-9]+)<\/td>/ig;

  // チャンネルの抽出
  // <th abbr="J SPORTS 3" axis="J SPORTS 3" scope="row" class="channelLabel">
  var myRegexpChannel = /<th abbr="(J SPORTS [1234])" axis="(J SPORTS [1234])" scope="row" class="channelLabel">/ig;
  var match;

  while ((match = myRegexpDate.exec(text)) !== null) {
    Logger.log(match);

    var month = match[1];
    var day = match[2];
    var startTime = new Date(year, month - 1, day).getTime();
    Logger.log(startTime);
    if (todayTime <= startTime && startTime <= futureTime) {
      Logger.log("期間内");
    } else {
      Logger.log("期間外");
      continue;
    }

    var startAmPm = match[3];
    var startHours = match[4];
    if (startAmPm == "午後") {
      startHours = String(Number(startHours) + 12)
    } else if (startAmPm == "深夜") {
      // 深夜開始は日付を加算
      var tomorrow = new Date(year, month - 1, day);
      tomorrow.setDate(tomorrow.getDate() + 1);
      year = Utilities.formatDate(tomorrow, "Asia/Tokyo", "YYYY");
      month = Utilities.formatDate(tomorrow, "Asia/Tokyo", "MM");
      day = Utilities.formatDate(tomorrow, "Asia/Tokyo", "dd");
    }
    var startMinuts = match[5];
    var endAmPm = match[6];
    var endHours = match[7];
    if (endAmPm == "午後") {
      endHours = String(Number(endHours) + 12)
    }
    var endMinuts = match[8];
    Logger.log(month + day);
    Logger.log(startAmPm + startHours + startMinuts);
    Logger.log(endAmPm + endHours + endMinuts);

    match = myRegexpChannel.exec(text);
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

    //open パスワード prog add 20160409 2100 2130 BS244
    var order = "open " + password + " prog add " + year + month + day + " " +
      startHours + startMinuts + " " +
      endHours + endMinuts + " " +
      channel + " AF U1 EY";
    Logger.log(order);

    MailApp.sendEmail(email, "J Sports Cycle*" + year, order);
  }
}

function getDateTime(date) {
  var year = Utilities.formatDate(date, "Asia/Tokyo", "YYYY");
  var month = Utilities.formatDate(date, "Asia/Tokyo", "MM");
  var day = Utilities.formatDate(date, "Asia/Tokyo", "dd");
  Logger.log(year + "-" + month + "-" + day);
  var time = new Date(year, month - 1, day).getTime();
  return time
}

function regzaList() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog list l d");
}

function regzaRemain() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog remain");
}
