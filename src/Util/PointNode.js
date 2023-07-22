import treeNode from "./treeNode";

/**
 * For closet pair point algorithm use
 */
export default class PointNode extends treeNode{
    constructor(elements, id, parent = null){
        super(elements, id, parent);
        this.answer = [];
        this.distance = 600;
        this.interestArea = [];
        this.mergeArea = [];
        this.actionQueue = null;
        this.boundary = null;
        this.childAns = 'none';
        this.leftAnswer = [];
        this.rightAnswer = [];
        this.possibleAnswer = [];
        this.closet = [];

    }

    /**
     * Reset all attributes into default value
     */
    reset(){
        this.children = [];
        this.solved = false;
        this.answer = [];
        this.distance = 600;
        this.interestArea = [];
        this.mergeArea = [];
        this.actionQueue = null;
        this.boundary = null;
        this.childAns = 'none';
        this.leftAnswer = [];
        this.rightAnswer = [];
        this.possibleAnswer = [];
        this.closet = [];
    }
}
