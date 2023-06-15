class treeNode{
    constructor(node, id){
        this.node = node;
        this.children = [];
        this.id = id;
    }

    setChild(node){
        this.children = [...this.children, node];
    }

    removeChild(index){
        let tmp = this.children;
        tmp.splice(index,1);
        this.children = tmp;
    }

    map(callback, thisArg){
        let pointer = thisArg || this;
        let queue = [this];
        while(queue.length > 0){
            pointer = queue.shift()
            callback(pointer);
            queue.push(...pointer.children);
        }
    }

    flat(){
        let res = [];
        this.map((item)=>res.push(item));
        
        return res;
    }

    find(tree){
        let pointer;
        let queue = [this];
        while(queue.length > 0){
            pointer = queue.shift();
            if(pointer.id == tree.id){
                return pointer;
            }
            queue.push(...pointer.children);
        }
        return null;
    }
}

function splitNArray(array, n=2){
    let res = [];
    if(n > 0 && Number.isInteger(n)){
        let chunkSize = Math.ceil(array.length/n);
        for(let i = 0; i < array.length; i+= chunkSize){
            if(i+chunkSize <= array.length){
                res.push(array.slice(i, i+chunkSize));
            }else{
                res.push(array.slice(i,array.length));
            }
            
        } 
    }
    return res;
}



function GetUniqueID () {
    var time = Date.now().toString(36)
    var random = Math.random().toString(36)
    random = random.substring(2, random.length)
    return random + time
}

/**
 * 
 * @param {*Object} node An array of object 
 * @returns A treeNodes Object. {data: data, children:[treeNodes1, treeNodes2,....]}
 */
function treeNodes(node){
    return {node:node, children:[]};
}

function addNodes(source, target){
    console.log(source)
    source.children = [...source.children, target];
    return source;
}


function treeLayout(tree, width, height, nodeWidth=undefined, nodeHeight=undefined){
    let map = new Map();
    let maxDepth;
    let slope;
    if(nodeWidth == undefined){
        tree.mx = width / 2;
        tree.my = 0;   
        // DFS get the height of the tree
        maxDepth = depth(tree);
        slope = maxDepth == 1 ? 0 : height / (maxDepth - 1);
        // distribute x value;
        assignX(tree, slope);
        
        

    }
     
}

function depth(tree){
    if(tree.children.length == 0){
        return 1;
    }
    let children = tree.children;
    let max = - 1;
    for(let start = 0; start < children.length; start ++){
        let current = depth(children[start]);
        if(max < current){
            max = current;
        }
    }

    return 1 + max;
}

function assignX(tree, slope){
    if(tree.children.length == 0){
        return;
    }
    let leftPart = [];
    let rightPart = [];
    let midPart = null;
    let index;
    if(tree.children.length == 1){
        midPart = tree.children[0];
        midPart.mx = tree.mx;
        midPart.my = tree.my + slope;
        
        assignX(midPart,slope);
        return;

    }else if(tree.children.length >= 3 && tree.children.length % 2 != 0){
        let index = Math.floor(tree.children.length / 2);
        midPart = tree.children[index];
        leftPart = tree.children.slice(0 ,index);
        rightPart = tree.children.slice(index + 1, tree.children.length);
        midPart.mx = tree.mx;
        midPart.my = tree.my + slope;
    }
    else{
        let index = tree.children.length / 2;
        leftPart = tree.children.slice(0, index);
        rightPart = tree.children.slice(index, tree.children.length);
    }
    
    for(let start = 0; start < leftPart.length; start++){
        leftPart[start].mx = tree.mx - 50;
        leftPart[start].my = tree.my + slope;
        rightPart[start].mx = tree.mx + 50;
        rightPart[start].my = tree.my + slope;
        assignX(leftPart[start], slope);
        assignX(rightPart[start],slope);
    }
}

function findMaxMin(tree){

}

function normalize(value, range,){

}


function refinement(tree, slope){
    let map = new Map();
    let current = tree;
    let queue = [current];
    let childs = 1;
    let parentY = tree.y - slope;
    while(queue.length > 0){
        current = queue.shift();
        childs -= 1;
        // callback(pointer);
        current.y = parentY + slope;
        if(map.get(current.data.id)){
            console.log("first")
            let prev = map.get(current.data.id);
            let newValue = [((prev.x+current.x)/2), prev.y > current.y ? prev.y:current.y];
            current.display = "none";
            prev.x = newValue[0];
            prev.y = newValue[1];
            current.x = newValue[0];
            current.y = newValue[1];
        }else{
            map.set(current.data.id, current);
        }

        if(current.children){
           queue.push(...current.children);

        }
        if(childs <= 0){
            childs = queue.length;
            parentY += slope;
        }
        
    }
}






export {treeNode, GetUniqueID, splitNArray, treeLayout,refinement}
