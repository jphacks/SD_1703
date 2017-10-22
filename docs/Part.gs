function testIntegrate(){
  var purpose = ["飲む会"];
  var place = ["仙台"];
  var user = [""];
  var group = [];
  var date = ["10月"];
  var startDate = [new Date(2017,9,22,16)];
  var endDate = [new Date(2017,9,22,23)];

  integrate(purpose, place, user, group, date, startDate, endDate);
}

function integrate(purpose, place, user, group, date, startDate, endDate) {

  var adminaddress = "hoge@huga.com";

  var result = checkResultAndCreateMessage(purpose, place, user+group, date)
  if(result[0]){
    Logger.log("読み取り成功");
    //続行
  }
  else{
    //読み込み失敗
    Logger.log("読み取りエラー");
    GmailApp.createDraft(adminaddress, "読み取りエラー", result[1]).send()
    return;
  }

  
  
  var mailadd = [];
  var member = [];
  
  for(var i in user){
    member.push(i);
    mailadd.push(getEmailAddressByName(i));
  }
  
  for(var i in group){
    member.push(i);
    var a = mailadd.push(getEmailAddressesByGroupName(i));
    for(var j in a){
      mailadd.push(j);
    }
  }
  
  Logger.log(mailadd);
  
  var cal = getCalenders(mailadd);
  
  var proposedDate = detectFreeTime(mailadd, cal, startDate, endDate)
  
  var data = new Object();
  data.address = mailadd;
  data.member = member;
  data.date = proposedDate[0];
  data.place = place;

  Logger.log("確認メール送信");
  sendEmail(MAIL_TYPES.CHECK_FIRST,data);
}