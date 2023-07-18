/**
 * @deprecated Not used in the proejct
 * Store last state of tree Node
 */
export default class TreeState{
    /**
     * Initial A new State object which record target object's last time state.
     * @param {Object} target Target Object 
     * @param {Array<Object>} attrs Last time state of target object
     * @param {Any} state React Function Component's state  
     * @param {Function} [method=null] Function that used to set specified state 
     */
    constructor(target = null, attrs = null, state = null, method = null,){
        this.target = target;
        this.attrs = attrs;
        this.state = state;
        this.method = method;
    }

    /**
     * To rollback Object's current state to last version. if method is not provided, 
     * this function execute default rollback, otherwise, execute provided method
     */
    rollback(){
        if(this.method === null){
            for(let attr of this.attrs){
                this.target[attr[0]] = attr[1] 
            }
        }else{
           this.method(this.state);
        }
    }



}