function startt() {

  var object = new Object();
  object.title="title";
  object.startTime=new Date('July 21, 2017 16:00:00 UTC');
  object.endTime=new Date('July 22, 2017 20:00:00 UTC');
  object.location="sendai";
  addEvent([""],object);
}
function addEvent(address_list,object){
  var calendar=CalendarApp.createCalendar("mailtest2")
  Logger.log(calendar);
     option={
        sendInvites:true,
        guests:"k.gsm726@gmail.com"
      }
      var event=calendar.createEvent(object.title, object.startTime, object.endTime,option);
      event.setLocation(object.location);
      

}