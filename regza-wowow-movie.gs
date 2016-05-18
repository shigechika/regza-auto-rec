// TOSHIBA REGZA DBR-M590 WOWOWムービー初回放送を自動録画予約
// http://www.toshiba-living.jp/manual.pdf?no=89247&fw=1&pid=17487

var email = "regza@example.jp"; // REGZAの定期チェック先メアド
var password = "パスワード"; // REGZAメール予約パスワード

function regzaWowowMovie() {

  // 時間比較のためにTime値を使う
  var today = new Date();
  Logger.log("today:" + today);
  var todayTime = today.getTime();
  Logger.log("todayTime:" + todayTime);

  // 予約は直近3日先まで
  var future = today;
  future.setDate(future.getDate() + 3);
  Logger.log("future:" + future);
  var futureTime = future.getTime();
  Logger.log("futureTime:" + futureTime);

  // WOWOW番組検索条件
  var payload = {
    "term" : "value101on", // 初回放送
    "GenreSelect" : "01", // 映画
  };
  var options = {
    "method": "post",
    "payload": payload
  };
  var response = UrlFetchApp.fetch("http://www.wowow.co.jp/pg_info/include/pg_list.php", options);
  var html = response.getContentText("shift-jis");
  
  // WOWOW番組表の抽出
  // <input name="registerCheck_0" type="checkbox" value="107610@@001@@01@@20160518231500@@193" />
  var wowowRegexp = /<input name="registerCheck_\d*" type="checkbox" value="\d*@@\d*@@\d*@@(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})@@(\d{3})"/ig;
  var match;
  
  while ((match = wowowRegexp.exec(html)) !== null) {
    Logger.log(match);

    var year = match[1];
    var month = match[2];
    var day = match[3];
    var startHour = match[4];
    var startMinute = match[5];
    var startSecond = match[6];
    var channel = "BS" + match[7];
    
    Logger.log(year + month + day + startHour + startMinute + startSecond + channel);

    var startDate = new Date(year, month - 1, day, startHour, startMinute, startSecond, 000);
    Logger.log("startDate:" + startDate);
    var startTime = startDate.getTime();
    Logger.log("startTime:" + startTime);
    if (todayTime <= startTime && startTime <= futureTime) {
      Logger.log("期間内");
    } else {
      Logger.log("期間外");
      continue;
    }

    //　終了時刻を設定しないといけないので90分決め打ちで
    var endTime = startTime + 90 * 60 * 1000; // 90分をミリ秒変換
    var endDate = new Date();
    endDate.setTime(endTime);
    Logger.log("endDate:" + endDate);
    var endHour = Utilities.formatDate(endDate, "Asia/Tokyo", "HH");
    var endMinute = Utilities.formatDate(endDate, "Asia/Tokyo", "mm");
    
    // open パスワード prog add 20160518 2315 0045 BS193 AF H1 EY
    // EYにすると番組表から開始時刻と終了時刻を自動調整するの必須
    var order = "open " + password + " prog add " + year + month + day + " " +
      startHour + startMinute + " " +
      endHour + endMinute + " " +
      channel + " AF H1 EY";
    Logger.log(order);

    MailApp.sendEmail(email, "Regza Wowow Movie" + year + month + day, order);
  }
}
