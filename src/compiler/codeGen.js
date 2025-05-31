class Instruction{
    constructor() {
        this.code = [];
        this.stack = [];
        this.variables = {'console.log': true};
    }
    addEntry(){
        this.pushStack(new ProgramInstruction(), true);
    }
    pushStack(newInstruction, isEntry = false) {
        this.stack.push(newInstruction);
        if (isEntry){
            this.code.push(newInstruction);
            return;
        }else{
            this.code[this.code.length-1].body.push(newInstruction)
        }
       
    }
    popStack(){
        this.stack.pop();
    }
    currentInstruction() {
        return this.stack[this.stack.length - 1];
    }   
    addInstruction(instruction) {
        this.currentInstruction().addInstruction(instruction);
    }
    addLiteralInstruction(value, type){
        if (this.sayState){
            this.currentInstruction().args.push(value);
            this.closeSayState();
        }else{
            this.addInstruction(`${value}`);
        }
    }
 
    addVaribleInstruction(name, value){
        this.variables[name] = true;
        this.addInstruction(`let ${name} = ${value}`);
    }
    addCallInstruction(name, args = []) {
        if (!this.variables[name]){
            console.warn(`姐妹 ${name} 好像没有定义哦, 但放心，程序依然会运行`);
            return
        }
        this.addInstruction(new CallInstruction(name, args));
    }
    openNewFunction(functionName){
        this.variables[functionName] = true;
        this.pushStack(new FunctionInstruction(functionName));
    }
    
    closeNewFunction(){
        this.popStack()
    }
    generate() {
        return this.code.map((instruction) => {
            if (typeof instruction === 'string') {
                return instruction;
            }
            return instruction.generate();
        }).join('\n');
    }

    clear() {
        this.code = [];
    }
}
class CallInstruction extends Instruction{
    constructor(name, args = []) {
        super();
        this.name = name;
        this.args = args;
    }
    generate(){
        return `${this.name}(${this.args.join(', ')})`;
    }
}
class FunctionInstruction extends Instruction{
    constructor(name = 'function', args = [], body = []) {
        super();
        this.name = name;
        this.args = args;
        this.body = body;
        this.count = 0;
    }
    generate(){
        const bodyContent = this.body.map((instruction) => {
            if (typeof instruction === 'string') {
                return instruction;
            }
            return instruction.generate();
        }).join('\n');
        return `function ${this.name||'noname_'+this.count++}(${this.args.join(', ')}) {\n${bodyContent}\n}`;
    }
    addInstruction(instruction){
        this.body.push(instruction);
    }
}
class ProgramInstruction extends Instruction{
    constructor(name = 'program', body = []) {
        super();
        this.name = name;
        this.body = body;
    }
    addInstruction(instruction){
        this.body.push(instruction);
    }
    generate(){
        return `!function HerCodeProgramMainEntry(){\n${this.body.map((instruction) => {
            if (typeof instruction === 'string') {
                return instruction;
            }
            return instruction.generate();
        }).join('\n')}\n}()`;
    }
}

exports.Instruction = Instruction;