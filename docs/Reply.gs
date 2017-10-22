THREE_VALUE={
  TRUE:1,
  FALSE:2,
  UNKNOWN:3
}


function testf() {
  var id="5773451c-7390-4ee1-9bdb-49f2eb6c9c62";
  var answer1=["d1","y"];
  var answer2=["d2","n"];
  var answer3=["d3","y"];
  var answer=[answer1,answer2,answer3];
  var name="11";
  storeReplyToSS(answer,id,name);
}
function handler(id,answer,name){
  storeReplyToSS(answer,id,name);
}

function AllMemberChecked(id){
  var currentnum=getCurrentMemberNum(id);
  var eventnum=getEventMemberNum(id)
  if(currentnum==eventnum) return true
  else return false
    }


function storeReplyToSS(answer,id,name){
  var ss = openSpreadSheet();
  var sheets=ss.getSheets();
  var reply_sheet=getReplySheet(sheets);
  var maxrow=reply_sheet.getLastRow();
  var values = reply_sheet.getSheetValues(1, 1, maxrow, 8);
  var answer_1d=convert2Dto1D(answer);
  for(var i=0;i<values.length;i++){
    if(values[i][0]==id&&name==values[i][1]){
      for(var j=0;j<answer_1d.length;j++){
        var range = reply_sheet.getRange(i+1,j+3);
        range.setValue(answer_1d[j]);
      }
    }else if(i==values.length-1){
      var range = reply_sheet.getRange(maxrow+1,1);
      range.setValue(id);
      range=reply_sheet.getRange(maxrow+1,2);
      range.setValue(name);
      for(var j=0;j<answer_1d.length;j++){
        range = reply_sheet.getRange(maxrow+1,j+3);
        range.setValue(answer_1d[j]);
      }
      
      var check=AllMemberChecked(id);
      if(check){
        var maxrow=reply_sheet.getLastRow();
        var values=reply_sheet.getSheetValues(1, 1, maxrow, 8);
        var day1_count=0;
        var day2_count=0;
        var day3_count=0;
        var temp_index=-1;
        for(var i=0;i<values.length;i++){
          if(values[i][0]==id){
            temp_index=i;

            if(values[i][3].equals("y"))day1_count++;
            if(values[i][5].equals("y"))day2_count++;
            if(values[i][7].equals("y"))day3_count++;
            Logger.log(values[i][3]);
          }
          
        }
        const day1_data={
          count:day1_count,
          date:values[temp_index][2]
        }
        const day2_data={
          count:day2_count,
          date:values[temp_index][4]
        }
        const day3_data={
          count:day3_count,
          date:values[temp_index][6]
        }
        //send mail
        
        Logger.log(searchResultDate(day1_data,day2_data,day3_data));
        }
    }
    
  }
}
function searchResultDate(day1_data,day2_data,day3_data){
  if(day1_data.count>=day2_data.count&&day1_data.count>=day3_data.count)return day1_data.date;
  else if(day2_data.count>=day3_data.count)return day2_data.date;
  else return day3_data.date;
}
function getCurrentMemberNum(id){
  var ss = openSpreadSheet();
  var sheets=ss.getSheets();
  var reply_sheet=getReplySheet(sheets);
  var maxrow=reply_sheet.getLastRow();
  var values = reply_sheet.getSheetValues(1, 1, maxrow, 1);
  var counter=0;
  for(var i=0;i<values.length;i++){
    if(values[i][0]==id){
      counter++;
    }
  }
  return counter;
}
function getEventMemberNum(id){
  var ss = openSpreadSheet();
  var sheets=ss.getSheets();
  var Event_sheet=getEventSheet(sheets);
  var maxrow=Event_sheet.getLastRow();
  var values = Event_sheet.getSheetValues(1, 1, maxrow, 6);
  for(var i=0;i<values.length;i++){
    if(values[i][0]==id){
      var members_str=values[i][5];
      var members_arr=members_str.split(",");
      return members_arr.length;
    }
  }
  return -1;
}
function convert2Dto1D(array_2d){
  var result=[];
  for(var i=0;i<array_2d.length;i++){
    for(var j=0;j<array_2d[i].length;j++){
      result.push(array_2d[i][j]);
    }
  }
  return result;
}


function openSpreadSheet(){
  var ss_r = SpreadsheetApp.openById("10OjVmTnXdkuAW686HbrvGaurxNFIAXHoWQxFu2PIt2k");
  return ss_r;
}


function getEventSheet(sheets){
  if(sheets[0].getName()=="events"){
    return sheets[0]; 
  }else{
    return sheets[1]; 
  }
}
function getReplySheet(sheets){
  if(sheets[0].getName()=="replys"){
    return sheets[0]; 
  }else{
    return sheets[1]; 
  }
}



