//TODO: Add custom messages here instead of main.js
let ent = require('./Entities');
let ext = require('./Extensions');
let utils = require('./utils');
utils.setLevel('debug');
let log = utils.log;
let SystemEnvironment = ext.SystemEnvironment;

let tempBag = {};

SystemEnvironment.prototype._meta =
    {
        description: () => {
            return "An Environment entity which runs in the background" +
                " and allows executing a command every interval." +
                " Use if you require any kind of system monitoring";
        },
        reflectionHandler : (literalClass) => { 
            //Actual function, do not do anything here
            let args = utils.splitArgs(literalClass);
            log.debug("Args are: ", args);
            for (let i in args){
                tempBag[args[i]] = {
                  message: 'Input your value:',
                  type: 'input',
                  filter: (input) => {
                    return SystemEnvironment.prototype._meta.handleParameterInput(args[i], input);
                  },
                  choices: {
                    "confirm": (args)=> { console.log(`TEST ${args}`); }
                  }
                }; 
            }
            return {
              message: 'Configure arguments',
              choices: tempBag
            }
        },
        handleParameterInput: (parameter, input) => {
            log.info(`Wrote ${parameter} = ${input}`);
            tempBag[parameter]["answer"] = input;
            log.info("Current choices are" );
            log.info(tempBag);
            return input;
            //For now lets everything pass
        },
        resultBag: () => {
            return tempBag;
        }
    }