function myFunction() {
  
}

//こう使うというだけ
function parseDate(date){
  return new Date(date);
}

function createEventTestCase(){
  var calendar = new CalendarApp.getDefaultCalendar();7
  var title = "のみかい";
  var startTime = new Date("2017/10/21 10:00");
  var endTime = new Date("2017/10/21 23:00");
  var location = "宮城県仙台市"
  createEvent(calendar, title, startTime, endTime, location);
}

function checkResultTestCase(){
  var purpose = [];
  var location = ["仙台駅前", "国分町"];
  var target = ["自分"];
  var date = [];
  var adminaddress = "hor6018@gmail.com"
  
  var result = checkResultAndCreateMessage(purpose, location, target, date, adminaddress)
  if(result[0]){
    //続行
  }
  else{
    //読み込み失敗
    GmailApp.createDraft(adminaddress, "読み取りエラー", result[1]).send()
  }
  
}

function createEvent(calendar, title, startTime, endTime, location){
  var event = calendar.createEvent(title, startTime, endTime);
  event.setLocation(location);
}


function checkResultAndCreateMessage(purpose, location, target, date){
  var message = "";
  if(purpose.length < 1){
    message += "目的：\n"
  }
  if(location.length < 1){
    message += "場所：\n"
  }
  if(target.length < 1){
    message += "対象者：\n"
  }
  if(date.length < 1){
    message += "日時：\n"
  }
  if(message != ""){
    message = "以下の項目の読み取りに失敗しました。\n返信してください。\n\n" + message
    return [false,message];
  }
  return [true,""];
}