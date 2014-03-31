var exec = require('child_process').exec;
var inbetween = 3000;
var count = 0;
var build = function()  
{
   console.log("Building");
   exec("component build", function(error)
   {
	if(error)console.log("Error building: ", error);
          console.log('Change forced rebuild: ' + count++);
    setTimeout(build, 3000);
   });
}
setTimeout(build,0);
