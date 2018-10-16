#!/bin/node
/*
 * initial screen script, to be used by other scripts
 * (Except preinstall)
 */
const menu = require('inquirer-menu');
let entities = require('../Entities');
let meta = require('../Metadata');
let extensions = require('../Extensions');
const screen = [
  " __      __                             ",
  " \\ \\    / /                             ",
  "  \\ \\  / /__ _ __ _ __ ___   ___  _ __  ",
  "   \\ \\/ / _ \\ '__| '_ ` _ \\ / _ \\| '_ \\ ",
  "    \\  /  __/ |  | | | | | | (_) | | | |",
  "     \\/ \\___|_|  |_| |_| |_|\\___/|_| |_|"                           
]
const C = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
}

var count;

startScreen();
increaseCount();

function startScreen()
{
  for (line in screen)
  {
    console.log(C.FgBlue, screen[line]);
  }
  console.log("                                                         (Fonts by https://patorsk.com)");
  console.log(C.Reset, "_____________________________________________________________");
  console.log(C.Reset, "Welcome to the setup screen");
  console.log(C.Reset, "");
}

function increaseCount()
{
  if (!count) count = 1;
  else count++;
}

function getCount()
{
  return count;
}

const chooseEnvironment = {
  message: 'Select my Environment',
  choices: 
    entities.GetExtensionsMetadata(entities.Environment, menu)
};
 
const addDetectors = {
  message: 'Add a Detector',
  choices: {
    callApi: function() {
      console.log('red-api called');
      return;
    }
  }
};

const addNotifiers = {
  message: 'Add a Notifier',
  choices: {
    callApi: function() {
      console.log('red-api called');
      return;
    }
  }
};

const saveConfig = {
  message: 'Save to Local Config file.',
  choices: {
    callApi: function() {
      console.log('red-api called');
      return;
    }
  }
};

let level = 0;
 
function createMenu() {
  return {
    message: 'Choose your option(s) below',
    choices: {
      "Choose your Environment": chooseEnvironment,
      "Add a Detector": addDetectors,
      "Add a Notifier": addNotifiers,
      "Save to local Config file": saveConfig
    }
  };
};
 
menu(createMenu)
  .then(function() {
    console.log('bye');
  })
  .catch(function(err) {
    console.log(err.stack);
  });

exports.count = getCount();
exports.C = C;
