export default class Action{
    /**
     * Action's constructor
     * @param {String} name Action name 
     * @param {*} value data that needed to run solution function
     * @param {Function} solution the function that specify how to run execute this action
     */
    constructor(name, value, solution){
        this.name = name;
        this.value = value;
        this.solution = solution;

    }

    do(){
        console.log(this.name);
        this.solution(...this.value);
    }
}