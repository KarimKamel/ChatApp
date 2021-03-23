"use strict";
function formatTime() {
  //untested
  function padNumber(number, paddingCharacter, outputLength) {
    var numberString = number.toString();

    while (numberString.length < outputLength) {
      numberString = paddingCharacter.toString() + numberString;
    }
    return numberString;
  }

  const date = new Date();
  let hours = padNumber(date.getHours(), 0, 2);
  let minutes = padNumber(date.getMinutes(), 0, 2);
  let seconds = padNumber(date.getSeconds(), 0, 2);

  return `${hours}:${minutes}:${seconds}`;
}

const createDebug = require("debug");

createDebug.formatArgs = function (args) {
  // requires access to "this"
  const name = this.namespace;
  const useColors = this.useColors;

  if (useColors) {
    // example: prepend something to arguments[0]
    args[0] = `${formatTime()} ${name} ${args[0]}`;
  } else {
    // example: append something to arguments[0]
    args[0] = `${name} ${args[0]} ${formatTime()}`;
  }
};
module.exports.createDebug = createDebug;
