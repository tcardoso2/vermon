//
// Utils: General utils class for stuff which needs to be used by every other file in this module.
//        also referred in main, and can be accessed externally from the module via .Utils
// @author: Tiago Cardoso
//
let flatted = require('flatted');
let tracer = require('tracer');
let log = tracer.colorConsole({level:'warn'}); //trace level
log.warning = log.warn;

exports = module.exports = {

  JSON: {
    stringify: (str) => {
      try{
        return JSON.stringify(str);
      } catch (e){
        if (e instanceof TypeError){
          log.debug(`Error in stringifying object (${e.message}), attempting with "flatted"...`);
          try{
            return flatted.stringify(str);
          } catch(e){
            let msg = `Error in stringifying object (${e.message})`;
            log.warn(msg);
            return msg;
          }
        }
        //Unhandled, re-throw
        throw e;
      }
    }
  },
  log: log,
  setLevel: (traceLevel) => {
    log = tracer.colorConsole({level: traceLevel});
    log.warning = log.warn;
    return log;
  },
  getArgs: (func) => {
    if(func){
      // First match everything inside the function argument parens.
      var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
    
      // Split the arguments string into an array comma delimited.
      return args.split(',').map(function(arg) {
        // Ensure no inline comments are parsed and trim the whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();
      }).filter(function(arg) {
        // Ensure no undefined values are added.
        return arg;
      });
      }
  }
}
