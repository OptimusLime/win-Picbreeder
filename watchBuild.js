var build = function()  
{
   console.log("Building");
   exec("component build", function(error)
   {
          console.log('Change forced rebuild: ' + count++);
    setTimeout(build, 1000);
   });
}


try{
var path = require('path');
var exec = require('child_process').exec;
var watch = require('node-watch');

var count =0;

//watch this directory, any changes, execute build or make command
watch(path.resolve(__dirname), function(filename) {

  try{
	console.log("File changed: ", filename);  

    if(filename.indexOf("build/build.") == -1 && 
       filename.indexOf("node_modules") == -1 &&
       filename.indexOf(".git") == -1)
    {
        exec("component build", function(error)
        {
            console.log('Change forced rebuild: ' + count++);
        });
    }
  }
  catch(e)
  {
    console.log("Stop watching please");
    setTimeout(build,0);
  }
});
}
catch(e)
{
  setTimeout(build, 0);
}

