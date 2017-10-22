function test() {
  var id="5370d8fb-8910-4675-b3e3-fc39572aec68";
  
}
function extractAddress(name_include_address){
  if(name_include_address.indexOf("<") == -1){
    return name_include_address;
  }
  
  var left_del=name_include_address.split("<")[1];
  var address=left_del.split(">")[0];
  return address;
  
}
function getTo(id){
  var threads=GmailApp.search('subject:'+id);
  var message = threads[0].getMessages()[1]; // Get first message
  var to=message.getTo();
   Logger.log(threads[1].getFirstMessageSubject()); // Log the recipient of message
  var to_arr=to.split(",");
  for(var i=0;i<to_arr.length;i++){
    if(to_arr[i].indexOf("<")>=0){
      to_arr[i]=(extractAddress(to_arr[i]));
    }
  }
 return to_arr;
}
  
  