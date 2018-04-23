//
// Utils: General utils class for stuff which needs to be used by every other file in this module.
//        also referred in main, and can be accessed externally from the module via .Utils
// @author: Tiago Cardoso
//
let JSONCircular = require('circular-json');
let log = require('tracer').colorConsole();//new Log('debug');//, fs.createWriteStream('t-motion-detector.' + (new Date().getTime()) + '.log'));
log.warning = log.warn;

exports = module.exports = {
  JSON: {
    stringify: (str) => {
      try{
        return JSON.stringify(str);
      } catch (e){
        if (e instanceof TypeError){
          return JSONCircular.stringify(str);
        }
        //Unhandled, re-throw
        throw e;
      }
    },
    log: log //Log is supposed in future to be used via utils
  }
}
