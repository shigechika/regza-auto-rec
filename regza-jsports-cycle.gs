// TOSHIBA REGZA DBR-M590 Jスポサイクル初回放送番組を録画予約
// http://www.toshiba-living.jp/manual.pdf?no=89247&fw=1&pid=17487

var email = "regza@example.jp"; // REGZAの定期チェック先メアド
var password = "パスワード"; // REGZAメール予約パスワード

function regzaJsportsCycle() {

  // 時間比較のためにTime値を使う
  var today = new Date();
  var year = today.getYear();
  Logger.log("today:" + today);

  // 予約は直近3日先まで
  var future = new Date();
  future.setDate(future.getDate() + 3);
  Logger.log("future:" + future);

  // JSPORTSホームページ検索条件
  var payload = {
    "genre": "12", // 12:自転車，03:ラグビー，031211:トップリーグYAMAHAジュビロ，00501：スーパーバイク世界選手権
    "broad_kbn[]": "2", // 初回放送（生放送＋録画初回放送）
    "channel[1]" : "306", // J SPORTS 1
    "channel[2]" : "307", // J SPORTS 2
    "channel[3]" : "256", // J SPORTS 3
    "channel[4]" : "253", // J SPORTS 4
  };
  var options = {
    "method": "post",
    "payload": payload
  };
  var response = UrlFetchApp.fetch("https://www.jsports.co.jp/search/sys/program/", options);
  var text = response.getContentText("EUC-JP");

/*
<td class="timeschedule">07月05日（木）<br />
深夜 01:00 - 深夜 03:30</td>
<td class="program">
<dl>
<dt>
<img class="icon" src="/program_guide/common/img/icon_pg_live.gif" alt="生放送" width="24" height="13" />
</dt>
<dd>
<a href="/program_guide/69060.html">Cycle*2018　ツール・ド・フランス チームプレゼンテーション<br />ラ・ロシュ＝シュル＝ヨン</a><span class="icon"></span></dd>
</dl>
<ul class="program-icon">
<li class="program-icon__item"><img src="/share/img/icon_jsports_ondemand.png" alt="JSPORTオンデマンド"></li><li class="program-icon__item program-icon__item--jsp"><img src="/share/img/icon_jsp_channel4.png" alt="JSPORT 4"></li>
*/
  var jspoRegexp = /<td class="timeschedule">(\d+)月(\d+)日.*\n(午前|午後|深夜) ?(\d+):(\d+) - (午前|午後|深夜) ?(\d+):(\d+)<\/td>\n<td class="program">\n<dl>\n<dt>\n<img .*\/>\n<\/dt>\n<dd>\n<a href=".*">(.*)<\/a>.*<\/dd>\n<\/dl>\n<ul class="program-icon">\n.*<li class="program-icon__item program-icon__item--jsp"><img src="\/share\/img\/icon_jsp_channel\d\.png" alt="(J ?SPORTS? \d)"><\/li>/ig;
  var match;

  while ((match = jspoRegexp.exec(text)) !== null) {
    Logger.log(match);

    var month = match[1];
    var day = match[2];

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
    
    var start = new Date(year, month - 1, day, startHours, startMinuts); // 注意：月は0はじまり
    Logger.log(start);
    if (today.getTime() <= start.getTime() && start.getTime() <= future.getTime()) {
      Logger.log("Within Range");
    } else {
      Logger.log("Out of Range");
      continue;
    }

    var endAmPm = match[6];
    var endHour = match[7];
    if (endAmPm == "午後") {
      endHour = String(Number(endHour) + 12)
    }
    var endMinute = match[8];
    var program = match[9].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'　'); // HTMLタグ削除

    Logger.log(month + day);
    Logger.log(startAmPm + startHour + startMinute);
    Logger.log(endAmPm + endHour + endMinute);
    Logger.log(program);

    var channel;
    switch (match[10]) {
      case "JSPORT 1":
        channel = "BS242";
        break;
      case "JSPORT 2":
        channel = "BS243";
        break;
      case "JSPORT 3":
        channel = "BS244";
        break;
      case "JSPORT 4":
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

    MailApp.sendEmail(email, "Regza Jsports Cycle " + year + month + day + " " + program, order);
  }
}

function regzaList() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog list l d");
}

function regzaRemain() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog remain");
}
