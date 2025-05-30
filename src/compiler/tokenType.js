let counter = 0;
function ioa(){
    return counter++;
}
const tokenType ={
    "SayKeyword": "SayKeyword",
    'WHITESPACE': "WHITESPACE",
    'IDENTIFIER': "IDENTIFIER",
    'StringLiteral': "StringLiteral",
    'Colon': "Colon",
    'EndKeyWord': "EndKeyWord",
    'FunctionKeyword': "FunctionKeyword",
    'LeftBrace': "LeftBrace",
    'RightBrace': "RightBrace",
    'StartKeyWord': "StartKeyWord",
    'MagicFirstLine': "MagicFirstLine",
};
exports.tokenType = tokenType;