var MailType = {
  ADMIN_START : 1,// Mail of start scheduling
  ADMIN_REGISTER : 2,
  ADMIN_CONFIRM : 3,
  ADMIN_DATE : 4, 
  OTHER_REPLY : 5,// Mail of participants' reply
  ADMIN_END : 6// Mail of end scheduling
};
  
var Subject = {
  ADMIN_REPLY : "情報登録メール",
  ADMIN_CONFIRM : "情報確認メール",
  ADMIN_DATE : "仮日程登録メール",
  OTHER_REPLY : "日程確認メール",
  ADMIN_END : "最終確認メール"
};

var Message = {
  ADMIN_REPLY : "以下をコピーして各項目に回答し，当アカウントと *参加者全員* に返信してください。（件名は変更しないでください．）\n希望日時や参加者、場所を複数指定する場合は改行して回答してください。\n↓次の行からコピー↓\n参加者の皆様\n**です。\n\n現在，以下の通りにスケジュール作成を予定しています．\n詳細は追って連絡されますので，少々お待ちください．\n■ 目的\n\n■ 希望日\n*月*日～*月*日\n■ 希望時間帯\n*時～*時\n■ 所要時間\n*分程度\n■ 場所\n\n以上 ←ここまでコピー",
  ADMIN_CONFIRM : "以下の内容で日程調整を行います．よろしいですか？\nよろしければそのまま返信してください。\n訂正がある場合は件名を削除し、再度初めからスタートしてください。\n■ 目的\n{purpose}\n■ 希望日\n{datetime}\n■ 希望時間帯\n{timePeriod}\n■ 所要時間\n{duration}分程度\n■ 参加者\n{participant}\n■ 場所\n{place}",
  ADMIN_DATE : "希望された日程内容と参加者の日程を調整した結果，開催日の候補は以下となります．よろしいですか？\nよろしければそのまま返信してください。\n訂正がある場合は件名を削除し、再度初めからスタートしてください。\n- 開催日候補 -\n{datetime_beta}\n■ 目的\n{purpose}\n■ 希望日\n{datetime}\n■ 希望時間帯\n{timePeriod}\n■ 所要時間\n{duration}分程度\n■ 参加者\n{participant}\n■ 場所\n{place}",
  OTHER_REPLY : "日程確認メール",
  ADMIN_END : "最終確認メール"
};

var SERVER_EMAIL_ADDRESS = "c69sma@gmail.com";

(function(global) {
  var Mail;
  Mail = (function() {
    
    function Mail(to, from, subject, body, mailType) {
      this.to = to;
      this.from = from;
      this.subject = subject;
      this.body = body.replace(/[\r?\n]+/g,"&&");
      
      this.mailType = mailType;
      
      if (!(this.to && this.from != null && this.body != null)) throw new Error("the to, from and body is required");
    }

    return Mail;
  })();
  return global.Mail = Mail;
})(this);

function main() {
  var newMails = getNewMails();
  var classifiedMails = classifyMails(newMails);
  var processedMails = processMails(classifiedMails);
}
  
function getNewMails() {
    //未読メールを検索
    var thds = GmailApp.search("label:inbox is:unread");
  
  var newMails = Array();
  
    for(var n in thds){      
      var thd = thds[n]
        var msgs = thd.getMessages();
        for(m in msgs){
            var msg = msgs[m];
          if(!msg.isUnread()) continue;
          var to = msg.getTo().split(", ").filter(function(it){ return it != SERVER_EMAIL_ADDRESS; });
          var from = msg.getFrom();
          var subject = msg.getSubject()
            var body = msg.getPlainBody()
          newMails.push(new Mail(to, from, subject, body));
        }
        
      // 既読をつける
        thd.markRead();
    }
  return newMails;
}

function classifyMails(newMails) {
  var classifiedMails = Array();
  
  for(var m in newMails){
    var mail = newMails[m];
    
    var mailType;
    if(mail.subject.indexOf(Subject.ADMIN_REPLY) != -1){
      mailType = MailType.ADMIN_REPLY;
    }else if(mail.subject.indexOf(Subject.ADMIN_CONFIRM) != -1){
      mailType = MailType.ADMIN_CONFIRM;
    }else if(mail.subject.indexOf(Subject.ADMIN_DATE) != -1){
      mailType = MailType.ADMIN_DATE;
    }else{
      mailType = MailType.ADMIN_START;
    }
    
    classifiedMails.push(new Mail(mail.to, mail.from, mail.subject, mail.body, mailType));
  }
  
  return classifiedMails;
}

function processMails(classifiedMails){
  var sheetObj = SpreadsheetApp.openById("10OjVmTnXdkuAW686HbrvGaurxNFIAXHoWQxFu2PIt2k");
  var sheet = sheetObj.getSheetByName("events");
  
  for(var c in classifiedMails){
    var classifiedMail = classifiedMails[c]
    var uuid = getUuid(classifiedMail) || ""
    
    switch(classifiedMail.mailType) {        
      case MailType.ADMIN_START:        
        var lastRow = sheet.getLastRow()
        uuid = generateUuid();
        sheet.getRange(+lastRow + 1, 1).setValue(uuid);
        sheet.getRange(+lastRow + 1, 2).setValue(classifiedMail.from);
        
        GmailApp.sendEmail(classifiedMail.from, generateSubject(Subject.ADMIN_REPLY, uuid), Message.ADMIN_REPLY)
        break;
      case MailType.ADMIN_REPLY:
        var b = classifiedMail.body;
        
        var regexes = [
          /■ 目的&&(.+?)&&■/,
          /■ 希望日&&(\d{1,2}月\d{1,2}日～\d{1,2}月\d{1,2}日)(&&\d{1,2}月\d{1,2}日～\d{1,2}月\d{1,2}日)*?&&■/,
          /■ 希望時間帯&&(\d{1,2}時～\d{1,2}時)(&&\d{1,2}時～\d{1,2}時)*?/,
          /■ 所要時間&&(\d{1,3})分程度&&■/,
          /■ 場所&&(.+?)(&&.+?)*?&&以上/
        ];
        
        var matches = regexes.map(function(it){ 
          var match = b.match(it)
          if(match == null) {
            return null;
          }
          match.splice(0, 1);
          return match.filter(function(it){ return it != null }).map(function(it){ return it.replace("&&", "")});
        })
        
        if(matches.some(function(it){ return it == null })){
          var body = "不足項目がありましたので、再度" + Message.ADMIN_REPLY;
          GmailApp.sendEmail(classifiedMail.from, generateSubject(Subject.ADMIN_REPLY, uuid), body)
          return;
        }
        
        var purpose = matches[0];
        var datetime = matches[1];
        var timePeriod = matches[2];
        var duration = matches[3];
        var place = matches[4];
        matches.push(classifiedMail.to.map(function(it){ return extractAddress(it); }).join(","));
        var participant = matches[5];
        
        if(participant == ""){
          var error = "参加者0人";
          GmailApp.sendEmail(classifiedMail.from, "エラー", error)
          return;
        }
        
        var body = Message.ADMIN_CONFIRM
        .replace("{purpose}", purpose)
        .replace("{datetime}", datetime.map(function(it, index){ return "候補 " + (index+1) + " : " + it }).join("\n"))
        .replace("{duration}", duration)
        .replace("{timePeriod}", timePeriod)
        .replace("{participant}", participant)
        .replace("{place}", place.map(function(it, index){ return "候補 " + (index+1) + " : " + it }).join("\n"));
        
        var data = sheet.getDataRange().getValues()
        var index;
        for(var d in data){
          if(data[d][0] == uuid){
            index = +d+1;
          }
        }
        
        matches.forEach(function(it, i){
          sheet.getRange(index, i + 3).setValue(it)
        });
        
        GmailApp.sendEmail(classifiedMail.from, generateSubject(Subject.ADMIN_CONFIRM, uuid), body)
        
        break;
      case MailType.ADMIN_CONFIRM:
        
        var data = sheet.getDataRange().getValues()
        var index;
        for(var d in data){
          if(data[d][0] == uuid){
            index = +d+1;
          }
        }
        
        var now = new Date()
        var dates = sheet.getRange(index, 4).getValue().split("～").map(function(it){
          var y = now.getYear();
          var split = it.split("月").map(function(it){ return it.replace("日", "");});
          var dateString = y + "-" + split.map(function(it){ return ("0"+it).slice(-2); }).join("-");
          return new Date(dateString);
        });
        var timePeriods = sheet.getRange(index, 5).getValue().split("～").map(function(it){
          var hour = ("0" + it.replace("時", "").replace("日", "")).slice(-2);
          var temp = new Date(new Date("2000-01-01").setHours(hour));
          Logger.log(temp);
          return temp;
        });
        var duration = sheet.getRange(index, 6).getValue();
        var toArray = sheet.getRange(index, 8).getValue().split(",");
        
        Logger.log(toArray);
        
        var calendars = getCalendars(toArray);
        
        Logger.log(calendars);
        
        if(!calendars.some(function(it){ return it != null })) {
          var error = "当アカウントとカレンダーを共有しているアカウントが存在しません。\n当アカウントに1つ以上のカレンダーを共有してください。";
          GmailApp.sendEmail(classifiedMail.from, "エラー", error);
          return;
        }
       
        Logger.log("dates=" + dates)
        Logger.log("timePeriods=" + timePeriods)
        Logger.log("duration=" + duration)
        
        // TODO: 仮日程登録メールを送る
        var freeTime = detectFreeTimeFromDate(calendars, dates[0], dates[1], timePeriods[0], timePeriods[1], duration);
        
        var jpTimes = (dateToString(freeTime));
        
        var datetime_beta = freeTime.map(function(it, i){ return "候補 " + (i+1) + " : " + jpTimes[i] }).join("\n");
        
        var data = sheet.getDataRange().getValues()
        var index;
        for(var d in data){
          if(data[d][0] == uuid){
            index = +d+1;
          }
        }
        
        var purpose = sheet.getRange(index, 3).getValue()
        var datetime = sheet.getRange(index, 4).getValue().split(",");
        var timePeriod = sheet.getRange(index, 5).getValue()
        var duration = sheet.getRange(index, 6).getValue()
        var place = sheet.getRange(index, 7).getValue().split(",");
        var participant = sheet.getRange(index, 8).getValue()
        
        sheet.getRange(index, 9).setValue(freeTime.join(","));
        
        var body = Message.ADMIN_DATE
        .replace("{datetime_beta}", datetime_beta)
        .replace("{purpose}", purpose)
        .replace("{datetime}", datetime.map(function(it, index){ return "候補 " + (index+1) + " : " + it }).join("\n"))
        .replace("{duration}", duration)
        .replace("{timePeriod}", timePeriod)
        .replace("{participant}", participant)
        .replace("{place}", place.map(function(it, index){ return "候補 " + (index+1) + " : " + it }).join("\n"));
        
        GmailApp.sendEmail(classifiedMail.from, generateSubject(Subject.ADMIN_DATE, uuid), body);
        break;
      case MailType.ADMIN_DATE:
        // TODO: 日程確認メールを送る
        
        var data = sheet.getDataRange().getValues()
        var index;
        for(var d in data){
          if(data[d][0] == uuid){
            index = +d+1;
          }
        }
        
        var purpose = sheet.getRange(index, 3).getValue()
        var datetime = sheet.getRange(index, 4).getValue().split(",");
        var timePeriod = sheet.getRange(index, 5).getValue()
        var duration = sheet.getRange(index, 6).getValue()
        var place = sheet.getRange(index, 7).getValue().split(",");
        var participant = sheet.getRange(index, 8).getValue()
        var dateBeta = sheet.getRange(index, 9).getValue().split(",");
        
        var events = dateBeta.map(function(it, i){ 
          var d = new Date(it)
          var start = d
          var end = new Date(d.setHours(d.getHours() + (duration / 60)));
          
          Logger.log(start);
          Logger.log(end);
          
          var options = {
            description : purpose,
            location : place.join(","),
            guests : participant,
            sendInvites : true
          };
          var title = purpose + " の候補日" + (i+1)
          Logger.log(title);
          Logger.log(options);
          
          Logger.log(CalendarApp.getDefaultCalendar().getName());
          
          return CalendarApp.getDefaultCalendar().createEvent(title, start, end, options);
        });
        
        events.forEach(function(it){ Logger.log(it.getId()); });
        
        
        GmailApp.sendEmail(classifiedMail.from, "完了", "参加者の皆さんに招待を送りました！");
        
        // GmailApp.sendEmail(classifiedMail.from, generateSubject(Subject.OTHER_REPLY), body)
        break;
      case MailType.OTHER_REPLY:
        // TODO: 受け取りの確認など、全部受け取っていたら最終確認メールを送る
        break;
      case MailType.ADMIN_END:
        // TODO: スケジューリングの結果を全員に送る
        break;
    }
  }
}

function getEmailAddressByName(name){
 var contacts = ContactsApp.getContactsByName(name);
 if(contacts.length>0){
   var emails = contacts[0].getEmails();
   return emails[0].getAddress();
 }else{
   return null
 }
}

function getUuid(_mail) {
        var uuidMatch = _mail.subject.match(/\[id=(.+?)\]/)
        if(uuidMatch == null) return ""
        return uuidMatch[1]
}

function generateUuid() {
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

function generateSubject(subject, uuid){
  return subject + "[id=" + uuid + "]";
}


function dateToString(date){
  var str = [];
  for(i = 0; i < date.length;++i){
    if(date[i] == undefined)break;
    str[i] = date[i].getFullYear() + "年" + (date[i].getMonth()+1) + "月" + date[i].getDate() + "日" + date[i].getHours() + "時" + date[i].getMinutes() + "分";
  }
  return str;
}


function getCalendars(user) {
  var calendars = [];
  
  for(var i = 0;i < user.length; ++i){
    var c = CalendarApp.getCalendarById(user[i]);
    calendars.push(c);
  }
  
  return calendars;
}
