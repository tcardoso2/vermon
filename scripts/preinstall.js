

/* OS */

const os_x = ['darwin', 'freebsd', 'linux', 'sunos', 'win32'];
const os_m = ['win32'];

/* Quick reference to colors */

const Reset = "\x1b[0m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";

let success, exit_code;

/* Check Functions */

function is_os_allowed(the_os)
{
	return os_x.indexOf(the_os) >= 0;
}

function check_os()
{
  let _os = process.platform;
  console.log(`Checking if OS "${_os}" is allowed for this installation (${process.env.npm_package_name})...`);
  
  let result = is_os_allowed(_os);
  if (result)
  {
  	console.log(FgGreen, "OK to proceed.");
  }
  else
  {
  	console.log(FgRed, "OS is not compatible for this package. Aborting.")
  }
  return result;
}

/* Util functions */

function exit_conv(result)
{
  exit_code = result ? 0 : 1;
}

/* Main code */

console.log("Starting pre-install checks...");

success = check_os();

/* Exiting */
exit_conv(success);
console.log(Reset, `Exiting preinstall of (${process.env.npm_package_name}) with code ${exit_code}.`)

process.exit(exit_code);