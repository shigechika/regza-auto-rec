REGZA AUTO REC
==============
TOSHIBA REGZA DBR-M590 Automatic Recording by Goole Apps Script

はじめに
-------

TOSHIBA REGZA DBR-M590のおまかせ録画機能は[生]というキーワードを使った設定ができない仕様らしい。DBR-M590を入手してから[生]番組のおまかせ録画すべくキーワード試行錯誤しても失敗ばかりだった。番組検索機能では[生]が使えるのにお任せ録画のキーワードに[生]をいれても使えないという不可解な仕様。解決の糸口を知るべくサポートに問い合わせたら晴れて[生]はおまかせ録画不可能であること知った。（新番組の[新]はおまかせ録画できるのに[生]はおまかせ録画ができない背景から大人の事情で制限していると邪推。）

J Sports
--------

Jスポーツ自転車の[生]放送を自動録画する。自転車番組って放送開始時間がまちまちなので時間指定での連ドラ予約は期待できない。もちろん番組表からコツコツ手動予約はできる。春のクラッシックレースは週一くらいなので辛うじて対応できるけどグランツールとなると連日の寝不足に加え約3週間分 x 3セットの手動予約を完璧にこなす心労たるやハンパない。そこでDBR-M590のメール予約機能があるのでおまかせ録画機能に頼らず，JSPORTSホームページの番組表から[生]放送を抽出しメール予約すればへっぽこおまかせ録画機能の代替できるかもしれないと調べてコーディングしてみた。調べてみたら[初回]放送も合わせて録画予約出来そうなのでついでに実装したのがきっかけ。自転車以外にもラグビーとかWSBKとかダカールとかにも応用できるのでついでに対応。
J Sportsは2019年春にホームページがリニューアルした。その際に検索ページも新しくなったので追従。


WOWOW Movie
-----------

WOWOW映画の初回放送の自動録画。WOWOWのEPG番組表には初回放送番組に[初]というプレフィックスがつくのでREGZAおまかせ録画に[初]をセットしてみたがうまく動かない。どうやら[生]同様にバグか大人の事情かわからないが使えない模様。そこでWOWOWホームページから初回放送の映画だけを抽出しREGZAレコーダーへメール予約するスクリプトを書いた。WOWOWシネマだと大体21時くらいから初回放送の映画を放送するが前後することもあるし休日祝日は狂う。WOWOWプライムチャンネルだと事情も違う。このスクリプトだとどんな時間帯でもWOWOWプライム・ライブ・シネマ関係なくWOWOW全チャンネルの初回放送の映画はもれなく自動録画予約するのでおまかせ運用可能だ。くわしくはスクリプトを眺めていただきたいがWOWOWの番組表は番組開始時刻のみの掲載で終了時刻がわからない。そこで映画ってだいたい2時間だと想定し開始時刻2時間を終了時刻とみなしEYオプションとともに予約している。REGZAはEPG番組表に基づき終了時刻を微調整するという段取りで辻褄をあわせている。これで今のところ問題ない。

無保証
-----

Google Apps Scriptの勉強兼ねてスクリプト書いてみた。Google Apps Scriptにはタイマー起動（UNIXのcron）できるのでこのまま運用可能。毎日1回動させばOK。3日先までの自動予約をするので同じメールを3回送ることなる。冗長過ぎるならばタイマー起動の頻度を減らすか，自動予約先期間を短くして欲しい。力技かつエラー処理なく冗長で汚ったねーコードだけど動いている。無保証なのでよろしく。
