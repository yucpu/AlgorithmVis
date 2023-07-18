import { isSolved } from "./util";
class treeNode {
    /**
     * Initial A treeNode object that is using in d3 tree.
     * @param {[any]} elements 
     * @param {String} id the unique id of an treeNode 
     * @param {treeNode} parent the parent node of an treeNode
     */
    constructor(elements, id, parent = null) {
        this.elements = elements;
        this.original = elements;
        this.children = [];
        this.id = id;
        this.solved = isSolved(elements);
        this.parent = parent;
    
    }
    setChild(children) {
        this.children = [...this.children, children];
    }

    /**
     * Remove one child from treeNode
     * @param {String} id that indicate an unique treeNode
     */
    removeChild(id) {
        let tmp = this.children;
        let index = tmp.findIndex(element => element.id === id);
        tmp.splice(index, 1);
        this.children = tmp;
    }

    map(callback, thisArg) {
        let pointer = thisArg || this;
        let queue = [this];
        while (queue.length > 0) {
            pointer = queue.shift()
            callback(pointer);
            queue.push(...pointer.children);
        }
    }

    reset(){
        this.elements = this.original;
        this.children = [];
        this.solved = isSolved(this.elements);
        this.parent = this.parent;
    }

    /**
     * find specfic treeNode by the id of node in the whole tree 
     * @deprecated Not used in the project
     * @param {treeNode} tree target Tree 
     * @returns NUll if no such node finded in the tree, otherwise return the node.
     */
    find(tree) {
        let pointer;
        let queue = [this];
        while (queue.length > 0) {
            pointer = queue.shift();
            if (pointer.id === tree.id) {
                return pointer;
            }
            queue.push(...pointer.children);
        }
        return null;
    }
}

export default treeNode;