// TOSHIBA REGZA DBR-M590 Jスポサイクル初回放送番組を録画予約
// http://www.toshiba-living.jp/manual.pdf?no=89247&fw=1&pid=17487

var email = "regza@example.jp"; // REGZAの定期チェック先メアド
var password = "パスワード"; // REGZAメール予約パスワード

function regzaJspoCycle() {
// https://www.jsports.co.jp/search/program/?genre=12&is_first=1
// is_first=1 初回放送（生放送 + 録画初回放送）
  regzaJspoReservation("?is_first=1&genre=12", "U3"); // 自転車
}

function regzaJspoRugby() {
// https://www.jsports.co.jp/search/program/?genre=03&is_first=1
// genre=03 ラグビー
  regzaJspoReservation("?is_first=1&genre=0311", "H1"); // ワールドカップ
  regzaJspoReservation("?is_first=1&genre=0304", "H1"); // 日本代表
  regzaJspoReservation("?is_first=1&genre=0306", "H1"); // スーパーラグビー
  regzaJspoReservation("?is_first=1&genre=0312&sub_genre=0312-11", "H1"); //トップリーグ ヤマハ発動機
  regzaJspoReservation("?is_first=1&genre=0307", "H1"); // サ・ラグビーチャンピオンシップ
  regzaJspoReservation("?is_first=1&genre=0308", "H1"); // 海外ラグビー（その他）
  regzaJspoReservation("?is_first=1&genre=0305", "H1"); // 国内ラグビー（その他）
}

function regzaJspoWSBK() {
  regzaJspoReservation("?keyword=&genre=0501&sub_genre=0501-1&is_first=1", "U2"); // “スーパーバイク世界選手権” “スーパーバイク”
}

function regzaJspoDakar() {
  regzaJspoReservation("?keyword=&genre=05&sub_genre=0506-9&is_first=1", "U2");　// “その他モータースポーツ” “ダカール・ラリー”
}

function regzaList() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog list l d");
}

function regzaRemain() {
  MailApp.sendEmail(email, "REGZA LIST", "open " + password + " prog remain");
}

function regzaJspoReservation(query, drive) {

  // 時間比較のためにTime値を使う
  var today = new Date();
  var year = today.getYear();
  Logger.log("today:" + today);

  // 予約は直近3日先まで
  var future = new Date();
  future.setDate(future.getDate() + 3);
  Logger.log("future:" + future);

  var response = UrlFetchApp.fetch("https://www.jsports.co.jp/search/program/" + query);
  Logger.log("getResponseCode():" + response.getResponseCode());
  var text = response.getContentText("UTF-8");

/*
	<div class="result__box">
	<span class="channelIcon--live">生</span>
	<a href="/program_guide/12/06/72243_4207897" class="result__text--main">Cycle*2019　リエージュ〜バストーニュ〜リエージュ</a>
	<a href="/program_guide/12/06/72243_4207897" class="result__text--link"></a>
	</div>
	<p class="result__text--sub">放送日時：4月28日（日）午後9:10 - 深夜1:00</p>
	<div class="result__icons"> <span class="ch4--noEdge"></span> </div>
*/

  var re = / class="result__text--main">(.*)<\/a>\n.*<\/a>\n?.*<\/div>\n?.* class="result__text--sub">放送日時：(\d+)月(\d+)日（.）\n?.*(午前|午後|深夜) ?(\d+):(\d+) - (午前|午後|深夜) ?(\d+):(\d+)\n?.*<\/p>\n?.* class="result__icons"> <span class="ch(\d)--noEdge">/mgi;
  var match;

  while ((match = re.exec(text)) !== null) {
    Logger.log(match);

    var program = match[1];
    Logger.log(program);

    var month = ("0" + match[2]).slice(-2);
    var day = ("0" + match[3]).slice(-2);

    var startAmPm = match[4];
    var startHours = ("0" + match[5]).slice(-2);
    if (startAmPm == "午後") {
      startHours = String(Number(startHours) + 12)
    } else if (startAmPm == "深夜") {
      // 深夜開始は日付を加算
      var tomorrow = new Date(year, month - 1, day); // 月は0はじまり
      tomorrow.setDate(tomorrow.getDate() + 1);
      year = Utilities.formatDate(tomorrow, "Asia/Tokyo", "YYYY");
      month = Utilities.formatDate(tomorrow, "Asia/Tokyo", "MM");
      day = Utilities.formatDate(tomorrow, "Asia/Tokyo", "dd");
    }
    var startMinuts = match[6];
    
    var start = new Date(year, month - 1, day, startHours, startMinuts); // 注意：月は0はじまり
    Logger.log("today:" + today);
    Logger.log("start:" + start);
    if (today.getTime() <= start.getTime() && start.getTime() <= future.getTime()) {
      // Dateの比較はgetTime()を使う
      Logger.log("予約期間内");
    } else {
      Logger.log("予約期間外");
      continue;
    }    
    
    var endAmPm = match[7];
    var endHours = ("0" + match[8]).slice(-2);
    if (endAmPm == "午後") {
      // 午後は+12時間，深夜はそのまま
      endHours = String(Number(endHours) + 12)
    }
    var endMinuts = match[9];
    Logger.log(month + day);
    Logger.log(startAmPm + startHours + startMinuts);
    Logger.log(endAmPm + endHours + endMinuts);

    var channel;
    switch (match[10]) {
      case "1":
        channel = "BS242";
        break;
      case "2":
        channel = "BS243";
        break;
      case "3":
        channel = "BS244";
        break;
      case "4":
        channel = "BS245";
        break;
    }
    Logger.log(channel);

    //open パスワード prog add 20160409 2100 2130 BS244
    var order = "open " + password + " prog add " + year + month + day + " " +
      startHours + startMinuts + " " +
      endHours + endMinuts + " " +
      channel + " AF " + drive + " EY";
    Logger.log(order);

    MailApp.sendEmail(email, "REGZA JSPORTS " + year + month + day + " " + program, order);
    
  }
}
