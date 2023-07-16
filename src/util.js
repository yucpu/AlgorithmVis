class treeNode {
    constructor(elements, id, parent = null) {
        this.elements = elements;
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

    flat() {
        let res = [];
        this.map((item) => res.push(item));

        return res;
    }

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

/**
 * For closet pair point algorithm use
 */
class PointNode extends treeNode{
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

    }

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
    }
}


class TreeState{
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


class Action{
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

class ActionQueue{
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

/**
 * split an array into n parts smaller arrays. 
 * @param {Array} array an array
 * @param {integer number} n the amount of subarray.
 * @returns an array that contains series of arrays of value.
 */
function splitNArray(array, n = 2) {
    let res = [];
    if (n > 0 && Number.isInteger(n)) {
        let chunkSize = Math.ceil(array.length / n);
        for (let i = 0; i < array.length; i += chunkSize) {
            if (i + chunkSize <= array.length) {
                res.push(array.slice(i, i + chunkSize));
            } else {
                res.push(array.slice(i, array.length));
            }

        }
    }
    return res;
}


function GetUniqueID() {
    var time = Date.now().toString(36)
    var random = Math.random().toString(36)
    random = random.substring(2, random.length)
    return random + time
}

/**
 * 
 * @param {*Object} elements An array of object 
 * @returns A treeNodes Object. {data: data, children:[treeNodes1, treeNodes2,....]}
 */
function treeNodes(elements) {
    return { elements: elements, children: [] };
}

function addNodes(source, target) {
    console.log(source)
    source.children = [...source.children, target];
    return source;
}


function treeLayout(tree, width, height, elementsWidth = undefined, elementsHeight = undefined) {
    let map = new Map();
    let maxDepth;
    let slope;
    if (elementsWidth == undefined) {
        tree.mx = width / 2;
        tree.my = 0;
        // DFS get the height of the tree
        maxDepth = depth(tree);
        slope = maxDepth == 1 ? 0 : height / (maxDepth - 1);
        // distribute x value;
        assignX(tree, slope);



    }

}

function depth(tree) {
    if (tree.children.length == 0) {
        return 0;
    }
    let children = tree.children;
    let max = - 1;
    for (let start = 0; start < children.length; start++) {
        let current = depth(children[start]) + 1;
        if (max < current) {
            max = current;
        }
    }

    return max;
}

function assignX(tree, slope) {
    if (tree.children.length == 0) {
        return;
    }
    let leftPart = [];
    let rightPart = [];
    let midPart = null;
    let index;
    if (tree.children.length == 1) {
        midPart = tree.children[0];
        midPart.mx = tree.mx;
        midPart.my = tree.my + slope;

        assignX(midPart, slope);
        return;

    } else if (tree.children.length >= 3 && tree.children.length % 2 != 0) {
        let index = Math.floor(tree.children.length / 2);
        midPart = tree.children[index];
        leftPart = tree.children.slice(0, index);
        rightPart = tree.children.slice(index + 1, tree.children.length);
        midPart.mx = tree.mx;
        midPart.my = tree.my + slope;
    }
    else {
        let index = tree.children.length / 2;
        leftPart = tree.children.slice(0, index);
        rightPart = tree.children.slice(index, tree.children.length);
    }

    for (let start = 0; start < leftPart.length; start++) {
        leftPart[start].mx = tree.mx - 50;
        leftPart[start].my = tree.my + slope;
        rightPart[start].mx = tree.mx + 50;
        rightPart[start].my = tree.my + slope;
        assignX(leftPart[start], slope);
        assignX(rightPart[start], slope);
    }
}

function findMaxMin(tree) {

}

function normalize(value, range,) {

}


function refinement(tree, slope) {
    let map = new Map();
    let current = tree;
    let queue = [current];
    let childs = 1;
    let parentY = tree.y - slope;
    while (queue.length > 0) {
        current = queue.shift();
        childs -= 1;
        // callback(pointer);
        current.y = parentY + slope;
        if (map.get(current.data.id)) {
            let prev = map.get(current.data.id);
            let newValue = [((prev.x + current.x) / 2), prev.y > current.y ? prev.y : current.y];
            current.display = "none";
            prev.x = newValue[0];
            prev.y = newValue[1];
            current.x = newValue[0];
            current.y = newValue[1];
        } else {
            map.set(current.data.id, current);
        }

        if (current.children) {
            queue.push(...current.children);

        }
        if (childs <= 0) {
            childs = queue.length;
            parentY += slope;
        }

    }
}

/**
 * Get all nodes of a tree in specified layer
 * @param {treeNode} tree a Tree Object that has elements, children, solved and id attributes. children is an array.  
 * @param {Integer} layer that used to specify the layer
 * @returns {treeNode[]} an array contains all nodes in same layer
 */
function getNodesAt(tree, layer) {
    let res = [];
    let currentLayer = 0;
    let stack = [tree];
    let visited = [-1, -1];
    let children;
    let top;
    while (stack.length > 0) {
        top = stack.at(stack.length - 1);
        visited[currentLayer + 1] += 1;
        if (currentLayer == layer) {
            // reach to target layer
            res.push(top);
            stack.pop();
            visited.pop();
            currentLayer -= 1;
            continue;
        }

        if (top.children.length <= 0) {
            // No children
            stack.pop();
            visited.pop();
            currentLayer -= 1;
            continue;
        } else {
            children = top.children;
        }
        let childrenIndex = visited[currentLayer + 1];
        if (childrenIndex >= children.length) {
            // found all childrens, go back
            stack.pop();
            visited.pop();
            currentLayer -= 1;
            continue;
        } else {
            stack.push(children[visited[currentLayer + 1]]);
            visited.push(-1);
            currentLayer += 1;
            continue;
        }
    }

    return res;
}


/**
 * classifing an array of treeNodes by their parent's ID, tree Nodes that share same parent will be
 * allocated into one array.
 * @param {Array} array that contains a series of trees. 
 * @returns {treeNode[][]} an two diemensional array. trees in same array shares same parent
 */
function splitByParentID(array) {
    let res = [];
    let temp = [];
    for (let i = 0; i < array.length; i++) {
        if (temp.length == 0) {
            temp.push(array[i]);
        } else if (temp.at(0).parent.id == array[i].parent.id) {
            // same parent (by parent id
            temp.push(array[i]);
        } else {
            res.push(temp);
            temp = [];
            temp.push(array[i]);
        }
    }

    if(temp.length != 0){
        res.push(temp);
    }

    return res;
}


/**
 * determine whether the data is solved or not
 * @param {Array} data 
 * 
 * @returns true if data is solved, false otherwise
 */
function isSolved(data) {
    return data.every((element, index, array) =>
        index == 0 || element.value > array[index - 1].value
    )
}


/**
 * Add attributes of points to the treeNode
 * @param {treeNode} treeNode Target treeNode that need to be set 
 * @param {String} action the attribute's name 
 * @param {Object} value the attr's value
 */

function addPointAttrs(treeNode,attrName, value){
    switch(attrName){
        case 'answer':
            treeNode[attrName] = value;
            return;
        case 'boundary':
            treeNode[attrName] = value;
            return;
        case 'interestArea':
            treeNode[attrName] = value;
            return;
        case 'actionQueue':
            treeNode[attrName] = value;
            return;
        case 'mergeArea':
            treeNode[attrName] = value;
            return;
        default:
            return;
    }
    //treeNode[attrName] = value;
}

/**
 * random generate some non-duplicate points in certain range.
 * @param {Integer} range positive integer
 * @param {Integer} amount amount of points 
 * @returns {[{x:Integer, y:Integer}]} an array of point.
 */
function pointGenerator(range, amount){
    let dataset = [];
    let xPools = [...Array(range).keys()];
    let yPools = [...Array(range).keys()];
  
    for(let start = 0; start < amount; start++){
        let x = xPools.splice(Math.floor(Math.random()*xPools.length) , 1)[0];
        let y = yPools.splice(Math.floor(Math.random()*yPools.length), 1)[0];
        dataset.push({key:`key${x}${y}`, value:{x:x, y:y}});
    }

    dataset = sortPoints(dataset, 'x');
    return dataset;
}


/**
 * Mergesort an array of point by x-coordination, then by y-coordination
 *  
 * @param {[{x:Integer, y:Integer}]} dataset 
 * @param {String} classifer sort array by specified attrs 
 */
function sortPoints(dataset, classifer){
    
    if(dataset.length == 1){
        return dataset;
    }

    let res = [];
    let part1 = sortPoints(dataset.slice(0, Math.ceil(dataset.length / 2)), classifer);
    let part2 = sortPoints(dataset.slice(Math.ceil(dataset.length / 2), dataset.length), classifer);

    let point1 = 0;
    let point2 = 0;
    while(point1 < part1.length && point2 < part2.length){
        if(part1[point1].value[classifer] < part2[point2].value[classifer]){
            res.push(part1[point1]);
            point1 += 1;
        }else if(part1[point1].value[classifer] > part2[point2].value[classifer]){
            res.push(part2[point2]);
            point2 += 1;
        }else{
            res.push(part1[point1]);
            point1 += 1;
        }
    }

    if(point1 < part1.length){
        res = res.concat(part1.slice(point1, part1.length));
    }else{
        res = res.concat(part2.slice(point2, part2.length));
    }
    return res;

}

/**
 * To know whther p1 isEqual to p2
 * @param {{x:Integer, y: Integer}} p1 point one
 * @param {{x:Integer, y: Integer}} p2 point two
 * @returns {Boolean} return true if p1 and p2 have same coordination, otherwise false
 */
function isEqualPoint(p1, p2){
    if(p1 == undefined){
        return false;
    }
    if(p2 == undefined){
        return false;
    }
    if(p1.x == p2.x && p1.y == p2.y){
        return true;
    }
    return false;
}




export { treeNode, GetUniqueID, splitNArray, 
    treeLayout, refinement, getNodesAt, 
    depth, splitByParentID, pointGenerator, 
    sortPoints, addPointAttrs,isEqualPoint
    ,ActionQueue, Action, PointNode, TreeState}
