class treeNode {
    constructor(elements, id, parent = null) {
        this.elements = elements;
        this.children = [];
        this.id = id;
        this.sorted = isSolved(elements);
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
 * @param {treeNode} tree a Tree Object that has elements, children, sorted and id attributes. children is an array.  
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
 * determine whether the data is sorted or not
 * @param {Array} data 
 * 
 * @returns true if data is sorted, false otherwise
 */
function isSolved(data) {
    return data.every((element, index, array) =>
        index == 0 || element.value > array[index - 1].value
    )
}


class Point{
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

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
    return dataset;
}






export { treeNode, GetUniqueID, splitNArray, treeLayout, refinement, getNodesAt, depth, splitByParentID, pointGenerator}
