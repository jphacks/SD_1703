MAIL_TYPES = {
  CHECK_FIRST : 0,      //自動生成されたメールが適切か確認するメール
  QUESTION_FIRST : 1,   //対象者に参加できるか否か集計するメール
  CHECK_SECOND : 2,     //自動生成されたメール(集計結果から割り出した日程を知らせる)が適切か確認するメール
  QUESTION_SECOND : 3,  //対象者に割り出された日程でいいか確認するメール
  
  ERROR_FIRST : 10,     //日程調整開始メールの不足した情報の聞き直しメール
}

//input:void|output:void;[handler]
function myFunction() {
  var mailadd=getEmailAddressByName("生出先生");
   Logger.log(mailadd);
  Logger.log(getEmailAddressesByGroupName("teacher"));
  var data = new Object();
  data.address=["hor6018@gmail.com"];
  data.member=["高橋","佐藤"];
  data.date=[createDateText(new Date("Thu, 06 Sep 2012 00:00:00 +0900")),createDateText(new Date("Wed, 06 Sep 2014 10:00:00 +0900"))]; 
  data.place=["sendai"];
  data.porpose="のみかい";
  data.need = ["目的", "場所"];
  sendEmail(MAIL_TYPES.QUESTION_SECOND,data);
}
function ttt(){
 var data = new Object();
  data.host="k.gsm726@gmail.com";
  data.participant=["高橋","砂糖"];
  data.date=[createDateText(new Date("Thu, 06 Sep 2012 00:00:00 +0900")),createDateText(new Date("Wed, 06 Sep 2014 10:00:00 +0900"))]; 
  data.place=["sendai"];
  data.purpose="のみかい";
  data.duration="20";
  storeEventToSS(data,generateUuid());
}
//input:name(String)|output:Mail address(String);
function getEmailAddressByName(name){
  var contacts = ContactsApp.getContactsByName(name);
  if(contacts.length>0){
    var emails = contacts[0].getEmails();
    return emails[0].getAddress();
  }else{
   return null 
  }
}

//input:name(String)|output:Mail group(Object);
function getGroupByName(name){
 var group  = ContactsApp.getContactGroup(name);
 return group;
}

//input:name(String)|output:addresses_list(list<String>);
function getEmailAddressesByGroupName(name){
  var addresses_list=[];
  var group=getGroupByName(name);
  if(group!=null){
    var contacts = group.getContacts();
    for(var i=0;i<contacts.length;i++){
      var emails = contacts[i].getEmails();
      addresses_list.push(emails[0].getAddress());
    }
    return addresses_list;
  }else{
    return null;
  }
}
//input:void|output:uuid(String);
function generateUuid() {
    // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
    // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    var chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
    for (var i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case "x":
                chars[i] = Math.floor(Math.random() * 16).toString(16);
                break;
            case "y":
                chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                break;
        }
    }
    return chars.join("");
}

//input:type(int),object(Object)|output:void
function sendEmail(type,object){
  const member=object.member.toString();//array
  const uuid=generateUuid();
  const toAddresses=object.address;//array
  const nl="\n";
  switch(type){
    case MAIL_TYPES.CHECK_FIRST:
      var date=createCandidateText(object.date);//array
      var place=createCandidateText(object.place);//array
      
      var message= "■ 日時" +nl+ date+nl+"■ 場所"+nl+place+nl+"■ 参加者"+nl+member+nl+nl;
      for(var i=0;i<toAddresses.length;i++){ 
      GmailApp.sendEmail(toAddresses[i], "日程調整内容確認メール"+uuid,"以下の内容で日程調整を行います．よろしいですか？"+nl+message);
      }
      break;
      
    case MAIL_TYPES.QUESTION_FIRST:
      var place=object.place[0]//array
      var porpose = object.porpose;
      var headerMessage = "このメールは"+porpose+"の参加者に送信しています.\n\n希望された日程内容と参加者の日程を調整した結果，開催日の候補は以下となります.\n候補日の中から都合が合う日に\"○\",合わない日に\"×\"を候補日の左側に記入し，返信して下さい.\n";
      var message = "－開催日候補－"+nl+date+nl+"―希望された日程内容―"+nl+"目的:"+porpose+nl+"場所:"+place+nl+"メンバー："+member+nl;
      //for(var i=0;i<member.length;i++){ 
      //GmailApp.sendEmail(getGroupByName(member[i]), porpose+"の仮日程確認メール"+uuid,headerMessage+nl+message);
      //}
      for(var i=0;i<toAddresses.length;i++){ 
      GmailApp.sendEmail(toAddresses[i], porpose+"の仮日程確認メール"+uuid,headerMessage+nl+message);
      }
      break;     
      
    case MAIL_TYPES.CHECK_SECOND:
      var date = object.date[0];
      var place = object.place[0];
      var porpose = object.porpose
      var headerMessage = "このメールは"+porpose+"の日程調整を希望された方に送信しています．\n\n希望された日程内容と参加者の日程を調整した結果，開催日の候補は以下となります．\n内容に変更がない場合は\"yes\"と返信して下さい．\n参加者へ開催日候補の確認メールを送信し，再度その候補から調整を行います．\n変更がある場合は，日程の訂正内容を返信して下さい．"
      var message = "－開催日候補－"+nl+date+nl+"―希望された日程内容―"+nl+"目的:"+porpose+nl+"場所:"+place+nl+"メンバー："+member+nl;
      for(var i=0;i<toAddresses.length;i++){ 
      GmailApp.sendEmail(toAddresses[i], porpose+"の仮日程確認メール"+uuid,headerMessage+nl+message);
      }
      break;
      
    case MAIL_TYPES.QUESTION_SECOND:
      var date = object.date[0];
      var place = object.place[0];
      var porpose = object.porpose
      var headerMessage = "このメールは"+porpose+"の参加者に送信しています．\n\n希望された日程内容と参加者の日程を調整した結果，開催日の候補は以下となります．\n参加できる場合は\"yes\"と返信して下さい．\n"
      var message = "－開催日候補－"+nl+date+nl+"―希望された日程内容―"+nl+"目的:"+porpose+nl+"場所:"+place+nl+"メンバー："+member+nl;
      for(var i=0;i<toAddresses.length;i++){ 
      GmailApp.sendEmail(toAddresses[i], porpose+"の仮日程確認メール"+uuid,headerMessage+nl+message);
      }
      break;
      
    case MAIL_TYPES.ERROR_FIRST:
      for(var i=0;i<toAddresses.length;i++){ 
      GmailApp.sendEmail(toAddresses[i], "日程調整内容の情報漏れ確認"+uuid,"目的/場所/メンバー/日時の情報が必要です．\n"+object.need.toString()+"の情報を記入し，返信してください．\n");
      }
      break;
      
    default:
      break;
  }
}

//input:array(array<object>)|output:string
function createCandidateText(array){
  var text="";
  for(var i=0;i<array.length;i++){
    text+="候補"+(i+1)+"： "+array[i]+"\n";
  }
  return text;
}
  
//input:date(Date)|output:string
function createDateText(date){
  var wNames = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"];
  return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日" + wNames[date.getDay()] + " " + ("0"+date.getHours()).slice(-2)  + ":" + ("0"+date.getMinutes()).slice(-2);
}
function openSpreadSheet(){
  var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/10OjVmTnXdkuAW686HbrvGaurxNFIAXHoWQxFu2PIt2k/edit");
  return ss;
}

function getEventSheet(){
  var ss=openSpreadSheet();
  var sheets=ss.getSheets();
  if(sheets[0].getName()=="events"){
    return sheets[0]; 
  }else{
    return sheets[1]; 
  }
}
function createStoreArrayFromObject(object){
  
  var arr=[];
  arr.push(object.host);
  arr.push(object.purpose)
  arr.push(object.date.toString());
  arr.push(object.duration);
  arr.push(object.participant.toString());
  arr.push(object.place)
  return arr;
  
}
function storeEventToSS(object,id){
  var sheet= getEventSheet();
  var maxrow=sheet.getLastRow();
  var values = sheet.getSheetValues(1, 1, maxrow, 8);
  var store_array=createStoreArrayFromObject(object);
  Logger.log( store_array );
  for(var i=0;i<values.length;i++){
    if(values[i][0]==id){
      for(var j=0;j<store_array.length;j++){
        var range = sheet.getRange(i+1,j+2);
        range.setValue(store_array[j]);
      }
    }else if(i==values.length-1){
      var range = sheet.getRange(maxrow+1,1);
      range.setValue(id);
      for(var j=0;j<store_array.length;j++){
        range = sheet.getRange(maxrow+1,j+2);
        range.setValue(store_array[j]);
      }
    }
    
  }
}
