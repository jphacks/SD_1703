# 大人数日程調整アシスタント

[![大人数日程調整アシスタント](thumbnail.PNG)](https://youtu.be/qlhcA_fLS0A)

## 製品概要
### SKD Tech

### 背景（製品開発のきっかけ、課題等）
今回のプロダクトの開発に至った背景は，学年が上がるにつれ，飲み会やゼミなどの日程調整に必要性を感じたためである．
大人数の飲み会などの開催に時間を取られることは，研究時間を大きく削り，生産性を低下させる一因となっている．

日程調整アシスタントはすでにいくつか開発されているが，それらは1対1の日程調整や全員の回答待ちを行うアンケートなど，
参加人数が大人数になる場合は日程調整をすることが難しく，負担が大きい．

そこで，飲み会などの企画参加者の予定表を把握し，空き時間検索から開催候補日の提案を支援することで
大人数の日程調整における作業の負担を軽減する．

### 製品説明（具体的な製品の説明）
本製品は，メールを通じて主催者と大人数の参加者の予定表から開催日の候補を見つけ提案を行う日程調整システム(c69sma@gmail.com)です．
システムを利用する関係者全員は，まず日程調整システムとカレンダーを共有する必要があります．

日程調整は以下の流れで行います．
飲み会の企画が立ち上がったら，幹事は日程調整システムに空メールを送信します．
システムは，最初のメールのテンプレートを作成し幹事に送信を行います．日程調整は以下の流れで行います．

1.飲み会やゼミの企画が立ち上がった際，幹事は日程調整システムに空メールを送信
2.空メールを受信後，サーバは日程調整に必要な情報の記入テンプレートを返信
3.幹事はテンプレート(目的/日時/場所/参加者)に従い，日程調整内容を記入し全参加者に返信を送る．
　(この時点で参加者は目的，日時などの情報が共有される)
4.サーバは参加者のメールアドレスから参加者のカレンダーを参照し，共通の空き時間を探索
5.探索して得られた3つ以下の開催日時候補を幹事と参加者に送信

### 特長

#### 1. 特長1
アシスタントとメールのやりとりで日程調整ができる！
ブラウザやその他のアプリ

#### 2. 特長2
飲み会などの企画参加者の予定表から時間検索を行うだけでなく，開催候補日を提案してくれる！

#### 3. 特長3
既存のスケジューリングアシスタントから拡張し，大人数の日程調整ができる！
実際，学生間のやりとりで1対1の日程調整では不十分な場合が多い．

### 解決出来ること
大人数の時間調整を自動化することにより，幹事が日程調整を行う負担を軽減することができる．

### 今後の展望
今回，開催日時候補を3つ以下に絞ることが出来たが，再度その候補から参加者に参加可能な日時を返答してもらい
日時を確定させる機能を実現することが出来なかったため，実装し開催日時の確定まで行いたい．
また，自然言語処理を行うことでフォーマットから日程調整に必要な情報を抽出するのではなく，メールの内容から
情報を抽出し，自動的に日程調整を行う．

## 開発内容・開発技術
### 活用した技術
#### API・データ
今回スポンサーから提供されたAPI、製品などの外部技術があれば記述をして下さい。
* Goodle Apps Script

### 独自開発技術（Hack Dayで開発したもの）
#### 2日間に開発した独自の機能・技術
* 受信したメールの内容を確認し内容に応じた処理を行い、メールを返信する
* 日程調整メールを受信したら、その他の宛先を確認して参加者を特定する
* 参加者のカレンダーを確認し、予定のない時間帯を判断する
