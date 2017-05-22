
/*
 * initial screen script, to be used by other scripts
 * (Except preinstall)
 */

const screen = [
"                    ___           ___                                      ___           ___      ",
"      ___          /  /\\         /  /\\          ___            ___        /  /\\         /  /\\     ",
"     /__/\\        /  /::|       /  /::\\        /__/\\          /__/\\      /  /::\\       /  /::|    ",
"     \\  \\:\\      /  /:|:|      /  /:/\\:\\       \\  \\:\\         \\__\\:\\    /  /:/\\:\\     /  /:|:|    ",
"      \\__\\:\\    /  /:/|:|__   /  /:/  \\:\\       \\__\\:\\        /  /::\\  /  /:/  \\:\\   /  /:/|:|__  ",
"      /  /::\\  /__/:/_|::::\\ /__/:/ \\__\\:\\      /  /::\\    __/  /:/\\/ /__/:/ \\__\\:\\ /__/:/ |:| /\\ ",
"     /  /:/\\:\\ \\__\\/  /~~/:/ \\  \\:\\ /  /:/     /  /:/\\:\\  /__/\\/:/~~  \\  \\:\\ /  /:/ \\__\\/  |:|/:/ ",
"    /  /:/__\\/       /  /:/   \\  \\:\\  /:/     /  /:/__\\/  \\  \\::/      \\  \\:\\  /:/      |  |:/:/  ",
"   /__/:/           /  /:/     \\  \\:\\/:/     /__/:/        \\  \\:\\       \\  \\:\\/:/       |__|::/   ",
"   \\__\\/           /__/:/       \\  \\::/      \\__\\/          \\__\\/        \\  \\::/        /__/:/    ",
"                   \\__\\/         \\__\\/                                    \\__\\/         \\__\\/     "
]

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"

startScreen();

function startScreen()
{
  for (line in screen)
  {
    console.log(FgBlue, screen[line]);
  }
  console.log("                                                         (Fonts by https://patorsk.com)");
  console.log(Reset, "_____________________________________________________________");
  console.log(Reset, "A NodeJS Motion detector, aimed for the Raspberry Pi.");
}