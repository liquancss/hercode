const {isLetter, isFirstLine}    = require('./util.js');
const {Instruction} = require('./codeGen.js');
const { tokenType } = require('./tokenType.js');
class Parser{
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.lastCacheValue = null; 
        this.codeGen = new Instruction();
        this.codeGen.addEntry();
        this.currentToken = null;
    }
    get currentChar() {
        return this.input[this.position];
    }
    skipWhitespace(){
        while (/\s/.test(this.currentChar)) {
            this.advance();
        }
    }
    advance() {
        this.position++;
    }
    eof(){
        return this.position >= this.input.length;
    }
    parseProgram() {
        this.skipWhitespace();
        
        while (!this.eof()) {
            parseStatement(this)
            this.skipWhitespace();
        }
    }
    matchToken(tokenType){
        const currentToken = this.currentToken;
        
        if (currentToken !== tokenType) {
            throw new Error(`Expected token type ${tokenType}, but got ${currentToken} at position ${this.position}`);
        }
        
        
        const _next = nextToken(this);
        this.currentToken = _next;
        return _next;
    }

}
// 解析 say 语句
function parseSayStatement(parser) {
    parser.matchToken(tokenType.SayKeyword);
    parser.skipWhitespace();
    const val = parser.lastCacheValue;
    parser.matchToken(tokenType.StringLiteral);
    parser.codeGen.addCallInstruction('console.log', [val]);
}
// 函数调用
function parseMayBeCallFunction(parser){
    const functionName = parser.lastCacheValue;
    parser.matchToken(tokenType.IDENTIFIER);
    if (parser.currentToken === tokenType.LeftBrace) {
        parser.matchToken(tokenType.LeftBrace);
        parser.matchToken(tokenType.RightBrace);
    }
    
    
    parser.codeGen.addCallInstruction(functionName, [])
}
// 解析 start: ... end
function parserHerCodeMainEntry(parser) {
    parser.matchToken(tokenType.StartKeyWord);
    parser.skipWhitespace();
    parser.matchToken(tokenType.Colon);
    while(parser.currentToken !== tokenType.EndKeyWord && !parser.eof()) {
        parseStatement(parser);
    }
    parser.matchToken(tokenType.EndKeyWord);
}
// 魔法首行
function parseMagicFirstLine(parser) {
    const magicLine = parser.lastCacheValue;
    parser.matchToken(tokenType.MagicFirstLine);
    
    parser.codeGen.addCallInstruction('console.log', [JSON.stringify(magicLine)]);
}
function parseStatement(parser) {
    switch(parser.currentToken){
        case tokenType.SayKeyword:
            parseSayStatement(parser);
            break;
        case tokenType.FunctionKeyword:
            parseUserDefinedFunction(parser);
            break;
        case tokenType.IDENTIFIER:
            parseMayBeCallFunction(parser);
            break;
        case tokenType.StartKeyWord:
            parserHerCodeMainEntry(parser);
            break;
        case tokenType.MagicFirstLine:
            parseMagicFirstLine(parser);
            break;
        default:
            throw new Error(`Unexpected token: ${parser.currentToken} at position ${parser.position}`);
    }
}
function parseUserDefinedFunction(parser){
    parser.matchToken(tokenType.FunctionKeyword);
    parser.skipWhitespace();
    parser.matchToken(tokenType.IDENTIFIER);
    const functionName = parser.lastCacheValue;
    parser.matchToken(tokenType.Colon);
    parser.codeGen.openNewFunction(functionName);
    parser.skipWhitespace();
    while(parser.currentToken !== tokenType.EndKeyWord && !parser.eof()) {
        parseStatement(parser);
    }
    parser.matchToken(tokenType.EndKeyWord);
    parser.codeGen.closeNewFunction();
}
function parseStringLiteral(parser) {
    const start = parser.position;
    const currentChar = parser.currentChar;
    parser.advance();
    while( parser.currentChar !== currentChar && !parser.eof()) {
        parser.advance();
    }
    const end = parser.position;
    parser.advance(); 
    const value = parser.input.slice(start + 1, end);
    return `"${value}"`;
}

function _nextToken(parser) {
    switch (parser.currentChar) {
        case ' ':
        case '\n':
        case '\t':
            parser.advance();
            return tokenType.WHITESPACE;
        case ':':
            parser.advance();
            return tokenType.Colon;
        case '"':
        case "'":
            parser.lastCacheValue = parseStringLiteral(parser);
            return tokenType.StringLiteral;
        case '(':
            parser.advance();
            parser.currentToken = tokenType.LeftBrace;
            return tokenType.LeftBrace;
        case ')':
            parser.advance();
            parser.currentToken = tokenType.RightBrace;
            return tokenType.RightBrace;
        case '#':
            while (!parser.eof() && parser.currentChar !== '\n') {
                parser.advance();
            }
            return tokenType.WHITESPACE; 
        default:
            if(isLetter(parser.currentChar)) {
                const start = parser.position;
                parser.advance();
                while( isLetter(parser.currentChar) && !parser.eof()) {
                    parser.advance();
                }
                const value = parser.input.slice(start, parser.position);
                if (value === "say") {
                    parser.currentToken = tokenType.SayKeyword;
                } else if (value === "function") {
                    parser.currentToken = tokenType.FunctionKeyword;
                } else if (value === "end"){
                    parser.currentToken = tokenType.EndKeyWord;
                }else if (value === "start"){
                    parser.currentToken = tokenType.StartKeyWord;

                }else {
                    parser.currentToken = tokenType.IDENTIFIER;
                }
                parser.lastCacheValue = value;
                return parser.currentToken;
            }else if(isFirstLine(parser.position, parser.input)) { // 魔法首行
                const start = parser.position;
                while(!parser.eof() && parser.currentChar !== '\n') {
                    parser.advance();
                }
                const end = parser.position;
                const value = parser.input.slice(start, end);
                parser.lastCacheValue = value;
                return tokenType.MagicFirstLine;
            }
            throw new Error(`Unexpected character: ${parser.currentChar} at position ${parser.position}`);
    }
}
function nextToken(parser) {
    if(parser.eof() ) {
        return null;
    }
    parser.currentToken = _nextToken(parser)
    if (parser.currentToken === tokenType.WHITESPACE) {
        return nextToken(parser);
    }
    return parser.currentToken;
}
function parse(input){
    const parser = new Parser(input);
    parser.skipWhitespace();
    // 第一个token
    nextToken(parser);
    parser.parseProgram();
    return parser;
}
const state  = parse(`
魔法首行
# 这是一个函数
function you_can_do_this: 
    say "Hello! Her World2" # 这是一个函数
end

function you_can_do_this_again: 
    say "Hello! Her Worldagain"
    say "Hello! Her Worldagain!!"
end
call_anything_you_want()
you_can_do_this()
start:
    you_can_do_this
    you_can_do_this_again()
end

    `);
const code = state.codeGen.generate();
// console.log(code); 
console.log('her_code 输出:\n\n')
new Function(code)(); 
