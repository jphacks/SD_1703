function test(){
  start = new Date(2017,9,22,0);
  end = new Date(start);
  end.setMinutes(end.getMinutes() + 3);
  Logger.log("start:" + start.toString() + ", end:" + end.toString());

}

function testFunction() {
  Logger.log("Logging Start");
  var user = ['hcktougou@gmail.com'];
  var cal = getCalenders(user);
  var start = [new Date(2017,9,22,16),new Date(2017,9,23,16)];
  var end   = [new Date(2017,9,22,23),new Date(2017,9,23,23)];
  Logger.log("calender " + cal[0].getId() + " is detected");
  
  var data = detectFreeTime(user, cal, start, end);
  Logger.log(data);
  var data2 = detectFreeTimeSpace(user, cal, start, end, 60);
  Logger.log(data2);
  
  var startDate = new Date(2017,9,22);
  var endDate = new Date(2017,10,25);
  var startTime = new Date(2000,10,10,16,20);
  var endTime = new Date(2000,10,10,22,0);
  var data3 = detectFreeTimeFromDate(cal, startDate, endDate, startTime, endTime, 90);
  Logger.log(data3);
}

function getCalenders(user) {
  var calenders = [];
  
  for(var i  = 0;i < user.length; ++i){
    calenders[i] = CalendarApp.getCalendarById(user[i]);
  }
  return calenders;
}

function detectFreeTime(user, calender, startDate, endDate){
  
  var dateBadRate = Array(startDate.length);//多いほど都合悪い
  var dateBadUser = Array(startDate.length);
  for(var i = 0;i < startDate.length; ++i){
    dateBadRate[i] = 0;
    //dateBadUser[i] = "";
  }
  //Logger.log("user:" + user);
  //Logger.log("startDate:" + startDate.toDateString());
  //Logger.log("endDate:" + endDate.toDateString());
  
  //日程ごとにその時間帯で予定あるか出す
  for(var i=0;i<startDate.length;i++){
    //Logger.log("startDate"+i+":" + startDate[i].toDateString());
    //Logger.log("endDate"+i+" :" + endDate[i].toDateString());
    for(var j=0;j<calender.length;j++){
      //Logger.log("i=" + i + ", j=" + j);
      var events = calender[j].getEvents(startDate[i], endDate[i]);
      for(var k=0;k<events.length;k+=200){
        //var eventStartTime = events.getStartTime();
        //var eventEndTime = events.getEndTime();
        //Logger.log(calender[j].getId() + " is bad in " + startDate[i].toDateString());
        ++dateBadRate[i];
        //dateBadUser[i] += user[i] + ", ";
      }
    }
  }
  
  //dataBadRateが少ない順にソートする
  var dateNum = Array(startDate.length);
  var dateRateCopy = Array(startDate.length);
  for(var i = 0;i < startDate.length; ++i){
    dateNum[i] = i;
    dateRateCopy[i] = dateBadRate[i];
  }
  for(var i = 0;i < startDate.length-1; ++i){
    for(var j = i+1;j < startDate.length; ++j){
      if(dateRateCopy[i] > dateRateCopy[j]){
        var swap = dateRateCopy[i];
        dateRateCopy[i] = dateRateCopy[j];
        dateRateCopy[j] = swap;
        swap = dateNum[i];
        dateNum[i] = dateNum[j];
        dateNum[j] = swap;
      }
    }
  }
  //Logger.log("BadRate: " + dateBadRate);
  //Logger.log("best time is "+ startDate[dateNum[0]] + " ~ " + endDate[dateNum[0]]);
  //Logger.log("bad user is " + dateBadUser[0]);

  var data = [];
  for(var i = 0; i < 3;++i){
    data[i] = startDate[dateNum[i]];
  }
  return dateToString(data);
}

function detectFreeTimeSpace(user, calender, startDate, endDate, dateRange){
  //dateRangeは予定に必要な時間、分単位で
  var teiansuu = 3
  var data = [];
  
  var acceptable = 0;//欠員を許す数 0でダメだと1つずつ増えます
  while(true){
  //Logger.log("許容:" + acceptable);
    for(var i = 0; i < startDate.length; ++i){
      var start = new Date(startDate[i]);
      //Logger.log("開始:" + start.toString());
      var detectFT = false;
      while(!detectFT){
        //Logger.log("開始:" + start.toString());
        var end = new Date(start);
        end.setMinutes(end.getMinutes() + dateRange);
        if(end.date > endDate[i].date)break;
        var tempstart = new Date(start);
        tempstart.setMinutes(tempstart.getMinutes() + 1);        
        var lost = 0;//欠員
        var lostends = [];//衝突する予定の終了時間
        //Logger.log("終了:" + end.toString());
        for(var j = 0; j < calender.length; ++j){
          //Logger.log(tempstart);
          //Logger.log(end);
          var events = calender[j].getEvents(tempstart, end);
          //Logger.log(j+"の予定数:" + events.length);
          if(events.length > 0){
            lost++;
            for(var k=0;k<events.length;k++){
              lostends.push(events[k].getEndTime());
              //Logger.log(j+"に予定検知:"+events[k].getEndTime());
            }
          }
        }
        if(lost <= acceptable){//欠員が許容できる
          //Logger.log("許容可能");
          var dat = new Date(start);
          data.push(dat);
          detectFT = true;
          break;// あとで変えるかも
        }else{
          //Logger.log("許容不可");
          lostends.sort(function(a,b) {
            return (a.date > b.date ? 1 : -1);
          });
          start = lostends[Math.min(i,lostends.length-1)];
        }
      }
      if(data.length >= teiansuu)break;
    }
    if(data.length > 0)break;
    acceptable++;
  }
  Logger.log("user:" + user);
  //Logger.log("startDate:" + startDate.toDateString());
  //Logger.log("endDate:" + endDate.toDateString());
  
  return data;
}

function detectFreeTimeSingle(user, calender, date, startDate, endDate, dateRange){
  var start = new Date(date);
  var end = new Date(date);
  start.setHours(startDate.getHours());
  start.setMinutes(startDate.getMinutes());
  end.setHours(endDate.getHours());
  end.setMinutes(endDate.getMinutes());
  var data = detectFreeTimeSpace(user, calender, start, end, dateRange)
  return data;
}

function detectFreeTimeFromDate(calender, startDate, endDate, startTime, endTime, dateRange){
  var user = [];
  var start = [];
  var end = [];
  
  var tempStart = new Date(startDate);
  tempStart.setMinutes(startTime.getMinutes());
  tempStart.setHours(startTime.getHours());
  var tempEnd = new Date(startDate);
  //Logger.log(tempStart+":"+tempEnd);
  tempEnd.setMinutes(endTime.getMinutes());
  tempEnd.setHours(endTime.getHours());
  //Logger.log(startDate+":"+startTime);
  //Logger.log(tempStart+":"+tempEnd);
  
  var endDay = endDate.getYear()*400 + (endDate.getMonth()+1)*32 + endDate.getDate();
  
  while(true){
    var tempDay = tempStart.getYear()*400 + (tempStart.getMonth()+1)*32 + tempStart.getDate();
    //Logger.log(endDay+":"+tempDay);
    if(endDay < tempDay)break;
    start.push(new Date(tempStart));
    end.push(new Date(tempEnd));
    tempStart.setDate(tempStart.getDate()+1);
    tempEnd.setDate(tempEnd.getDate()+1);
  }

  //Logger.log("start:"+start);0
  //Logger.log("end:"+end);
  
  var data = detectFreeTimeSpace(user, calender, start, end, dateRange);
  return data;
}

// 
function dateToString(date){
  var str = [];
  for(i = 0; i < date.length;++i){
    if(date[i] == undefined)break;
    str[i] = date[i].getFullYear() + "年" + (date[i].getMonth()+1) + "月" + date[i].getDate() + "日" + date[i].getHours() + "時" + date[i].getMinutes() + "分";
  }
  return str;
}