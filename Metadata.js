//TODO: Add custom messages here instead of main.js
let ent = require('./Entities');
let ext = require('./Extensions');
let SystemEnvironment = ext.SystemEnvironment;

SystemEnvironment.prototype._metadata = () => {
    return "An Environment entity which runs in the background\
and allows executing a command every interval.\
Use if you require any kind of system monitoring";
}
