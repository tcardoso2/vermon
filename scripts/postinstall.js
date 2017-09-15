/*
 * Tiny script for seting up a simple environment
 */

let _init = require("./init_script.js");
let readline = require('readline');
 
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let colors = _init.C;
let count = 0;

class Setup
{
  constructor(option){
  	this._latestAnswer;
  	this.option = option;
    this.recursiveAsyncReadLine();
  }

  getLatestAnswer(){
  	return this._latestAnswer;
  }

  recursiveAsyncReadLine() {
  	if (this.option) { this.doOption(this.option) }
  	else
  	{
      rl.question("Please Choose an option:\n"
        + "1) Option 1: Add an Entity\n"
        + "2) Option 2: Delete an Entity\n"
        + "3) Exit\n"
        , function (line) {
 
            switch (line){
                case "1":
                    console.log("this is option 1");
                    break;
                case "2":
                    console.log("this is option 2");
                    break;
                case "3":
                    return rl.close();
                    break;
                default:
                    console.log("No such option. Please enter another: ");
            }
            this.recursiveAsyncReadLine(); //Calling this function again to ask new question
      });
    }
  }

  doOption(option)
  {
  	this._latestAnswer = option;
  	console.log("`DOING SOME WORK ON ${option}`");
  }
}

//Will only execute if this is the main module being called from console
if (require.main === module) {
  let option;
  console.log("Starting post-script with args: ", process.argv);
  for (arg in process.argv)
  {
  	switch(arg)
  	{
  	  case '-o': option = process.argv[arg];
  	}
  }
  let setup = new Setup(option);
  count += 1;
}

exports.count = count;
exports.Setup = Setup;