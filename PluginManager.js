
let plugins = {};
let utils = require("./utils.js");
let log = utils.log;
let errors = require('./Errors');

/**
 * Adds an Extention plugin to the library. This means it runs the Pre and Post Plugin functions,
 * makes the added module available from the "plugins" varible, and adds its functions to vermon;
 * IMPORTANT: If you want the plugin to be able to access the parent's functions via the '_' accessor
 * Do not use this function but use vermon.use(<your_plugin>) instead.
 * @param {Object} ext_module is the actual module we are extending.
 * @return {boolean} True the plugin was successfully added.
 */
function AddPlugin(ext_module, parent){

  let runPreWorkflowFunctions = function(){
    log.info(`Attempting to run PreAddPlugin for ${ext_module.id}...`);
    if(!ext_module.PreAddPlugin) throw new Error("Error: PreAddPlugin function must be implemented.");
    ext_module.PreAddPlugin(parent, new parent.Entities.EntitiesFactory());
  }

  let runPostWorkflowFunctions = function(){
    log.info(`Attempting to run PostAddPlugin for ${ext_module.id}...`);
    if(!plugins[ext_module.id].PostAddPlugin) throw new Error("Error: PostAddPlugin function must be implemented.");
    plugins[ext_module.id].PostAddPlugin(plugins[ext_module.id]);
  }

  //Checks the extension module is not null
  if(!ext_module) throw new errors.MissingPluginError("Error: AddPlugin requires a Plugin module as first argument.");
  //Checks that the extension module has an id
  if(!ext_module.id) throw new Error("Error: The plugin object does not have a valid 'id' property.");
  //Cheks that there is no existing extension module with the same name
  if(plugins[ext_module.id]) throw new Error(`Error: A plugin object with id '${ext_module.id}' already exists.`);

  runPreWorkflowFunctions();  
  //Adds the module
  plugins[ext_module.id] = ext_module;
    
  //stores a reference of the exported functions of the main library in the object
  ext_module._ = parent;

  log.info("Added Plugin", ext_module.id);
  runPostWorkflowFunctions();

  return true;
}

/**
 * Removes an existing Extention plugin from the library
 * @param {string} ext_module_id is the id of the module to remove.
 * @return {boolean} True the plugin was successfully removed.
 */
function RemovePlugin(ext_module_id){

  let copy = plugins[ext_module_id];

  let runPreWorkflowFunctions = function(){
    if(!plugins[ext_module_id].PreRemovePlugin) throw new Error("Error: PreRemovePlugin function must be implemented.");
    plugins[ext_module_id].PreRemovePlugin();
  }

  let runPostWorkflowFunctions = function(){
    if(!copy.PostRemovePlugin) throw new Error("Error: PostRemovePlugin function must be implemented.");
    copy.PostRemovePlugin(module.exports);
  }

  runPreWorkflowFunctions();
  delete plugins[ext_module_id];
  log.info("Removed Plugin", ext_module_id);
  runPostWorkflowFunctions();

  return true;
}

/**
 * Gets the existing extension plugins added to the library
 * @return {object} the plugins object; 
 */
function GetPlugins(){
  return plugins;
}

/**
 * Removes all existing plugins 
 */
function ResetPlugins(){
  plugins = {};
}

//Plugin management functions
exports.AddPlugin = AddPlugin;
exports.RemovePlugin = RemovePlugin;
exports.GetPlugins = GetPlugins;
exports.ResetPlugins = ResetPlugins;