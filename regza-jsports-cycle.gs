// TOSHIBA REGZA DBR-M590 Jスポサイクル初回放送番組を録画予約
// http://www.toshiba-living.jp/manual.pdf?no=89247&fw=1&pid=17487

var email = "regza@example.jp"; // REGZAの定期チェック先メアド
var password = "パスワード"; // REGZAメール予約パスワード

function regzaJsportsCycle() {

  // 時間比較のためにTime値を使う
  var today = new Date();
  var year = today.getYear();
  Logger.log("today:" + today);
  var todayTime = today.getTime();
  Logger.log("todayTime:" + todayTime);

  // 予約は直近3日先まで
  var future = today;
  future.setDate(future.getDate() + 3);
  Logger.log("future:" + future);
  var futureTime = future.getTime();
  Logger.log("futureTime:" + futureTime);

  // JSPORTSホームページ検索条件
  var payload = {
    "genre": "12", // 12:自転車，03:ラグビー，0501：スーパーバイク世界選手権
    "broad_kbn[]": "2", // 初回放送（生放送＋録画初回放送）
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
  var jsportsRegexpDate = /<td class="timeschedule">(\d+)月(\d+)日.*<br \/>\n(午前|午後|深夜) ?(\d+):(\d+) - (午前|午後|深夜) ?(\d+):(\d+)<\/td>/ig;

  // チャンネルの抽出
  // <th abbr="J SPORTS 3" axis="J SPORTS 3" scope="row" class="channelLabel">
  var jsportsRegexpChannel = /<th abbr="(J SPORTS \d)" axis="(J SPORTS \d)" scope="row" class="channelLabel">/ig;
  var match;

  while ((match = jsportsRegexpDate.exec(text)) !== null) {
    Logger.log(match);

    var month = match[1];
    var day = match[2];
    var startTime = new Date(year, month - 1, day).getTime();
    Logger.log(startTime);
    if (todayTime <= startTime && startTime <= futureTime) {
      Logger.log("Within Range");
    } else {
      Logger.log("Out of Range");
      jsportsRegexpChannel.exec(text); // jsportsRegexpDateとjsportsRegexpChannelを同期取るために地団駄
      continue;
    }

    var startAmPm = match[3];
    var startHour = match[4];
    if (startAmPm == "午後") {
      startHour = String(Number(startHour) + 12)
    } else if (startAmPm == "深夜") {
      // 深夜開始は日付を加算
      var tomorrow = new Date(year, month - 1, day);
      tomorrow.setDate(tomorrow.getDate() + 1);
      year = Utilities.formatDate(tomorrow, "Asia/Tokyo", "YYYY");
      month = Utilities.formatDate(tomorrow, "Asia/Tokyo", "MM");
      day = Utilities.formatDate(tomorrow, "Asia/Tokyo", "dd");
    }
    var startMinute = match[5];
    var endAmPm = match[6];
    var endHour = match[7];
    if (endAmPm == "午後") {
      endHour = String(Number(endHour) + 12)
    }
    var endMinute = match[8];
    Logger.log(month + day);
    Logger.log(startAmPm + startHour + startMinute);
    Logger.log(endAmPm + endHour + endMinute);

    match = jsportsRegexpChannel.exec(text);
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

    // open パスワード prog add 20160409 2100 2130 BS244
    var order = "open " + password + " prog add " + year + month + day + " " +
      startHour + startMinute + " " +
      endHour + endMinute + " " +
      channel // + " AF U1 EY";
    Logger.log(order);

    MailApp.sendEmail(email, "Regza Jsports Cycle " + year + month + day, order);
  }
}

function regzaList() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog list l d");
}

function regzaRemain() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog remain");
}
