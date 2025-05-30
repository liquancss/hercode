
function isLetter(char){
    return /^[a-zA-Z_]$/.test(char);
}
function isFirstLine(position, input) {
    return position === 0 || /\s/.test(input.slice(0, position)); // Example for a magic first line
}
exports.isLetter = isLetter;
exports.isFirstLine = isFirstLine;