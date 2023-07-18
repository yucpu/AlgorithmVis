

export default class ActionQueue{
    constructor(){
        this.actions = [];
        this.length = this.actions.length;
    }

    /**
     * Push function. push one action into queue.
     * @param {Action} action Action
     */
    push(action){
        this.actions.push(action);
        this.length += 1;
    }

    pop(){
        if(this.actions.length == 0){
            return;
        }
        let head = this.actions.at(0);
        head.do();
        this.actions.shift();
        this.length -= 1;
    }

}