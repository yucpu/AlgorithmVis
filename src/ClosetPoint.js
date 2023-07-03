import React, { useEffect, useRef, useState } from 'react';
import { select, tree, linkVertical, hierarchy, transition, easeLinear, Selection, } from 'd3';
import {GetUniqueID, getNodesAt, depth, splitByParentID, pointGenerator, sortPoints, ActionQueue, PointNode, Action} from './util';

// const data = pointGenerator(500, 30);

export default function ClosetPoint() {
    let selfRef = useRef();
    let data = useRef(pointGenerator(500, 30)).current;
    let myTree = useRef(new PointNode(data, GetUniqueID(), null)).current;

    let [graph, setGraph] = useState();
    const nodeTransition = transition().duration(200).ease(easeLinear);
    let mergeQueue = useRef([]);
    let maxDepth = useRef(depth(myTree));
    let [update, setUpdate] = useState(1);
    let [selected, setSelect] = useState([]);
    let [nodesPointer, setPointer] = useState([myTree]);
    let [zoomState, setZoom] = useState({ k: 1, x: 0, y: 10 });
    let [mergeBtnOff, setMergeBtn] = useState(true);

    useEffect(()=>{
        if(maxDepth.current != 0){
          setMergeBtn(!getNodesAt(myTree, maxDepth.current).every(tree => tree.solved))
        }
      },[maxDepth.current, update])

    useEffect(() => {
        const container = select(selfRef.current).select('.animationArea').select('g');
        const d3treeLayout = tree().size([500, 200]);
        const linkGenerator = linkVertical().source(d => sourceRefine(d)).target(d => [d.target.x, d.target.y-10]);
        const root = hierarchy(myTree);
        d3treeLayout(root);
        drawNode(container, root.descendants());
        drawLinks(container, root.links(), linkGenerator);

    }, [update])

    useEffect(() => {
        const container = select(selfRef.current).select('.DetailArea').select('g');
        if (graph !== undefined) {
            container.selectAll('.point').data(graph.elements).join(appendPoint, updatePoint, removePoint);
            drawLines(container);
            drawAnswer(container);

        }
    }, [graph,update])


    /**
     * draw hierarchy node
     * @param {Selection} container d3 selection
     * @param {hierarchy} dataset d3 Node
     */
    function drawNode(container, dataset) {

        container.selectAll('.gnode')
            .data(dataset)
            .join(appendNode, updateNode, removeNode);
    }

    /**
     * append callback function
     * @param {Selection} enter d3 selection
     */
    function appendNode(enter) {
        enter.append('g').classed('gnode', true)
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .append('circle')
            .attr('r', 10)
            .attr('fill', 'white')
            .attr('stroke', d => d.data.solved ? "green" : "red")
            .on('click', (event, data) => { clickHandler(event, data) })

    }

    function updateNode(update) {
        update.attr('transform', d => `translate(${d.x}, ${d.y})`);
        update.selectAll('circle')
        .attr('stroke', d =>d.data.solved ? 'green' : 'red');
    }

    function removeNode(exit) {
        return exit.remove();
    }

    function sourceRefine(node) {
        let sourceX = node.source.x;
        let sourceY = node.source.y + 10;
        return [sourceX, sourceY];
    }

    /**
     * draw link
     * @param {Selection} container 
     * @param {hierarchy} dataset 
     * @param {linkVertical} linkGenerator 
     */
    function drawLinks(container, dataset, linkGenerator) {
        container.selectAll('.link').data(dataset)
            .join((enter) => { appendLink(enter, linkGenerator) }, (update) => { updateLink(update, linkGenerator) }, removeLink)
    }


    /**
     * append callback function that is used to append line between node
     * @param {Selection} enter 
     */
    function appendLink(enter, linkGenerator) {
        enter
            .append("path")
            .classed("link", true)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("d", linkGenerator)
            .style("opacity", `0`)
            .transition(nodeTransition)
            .style("opacity", `1`)
            .selection();
        return;
    }

    /**
     * update callback function that is used to update line between node
     * @param {Selection} update 
     */
    function updateLink(update, linkGenerator) {
        return update.attr("d", linkGenerator);
    }

    /**
     * Remove callback function that is used to remove exit line between node
     * @param {Selection} exit 
     */
    function removeLink(exit) {
        return exit.remove();
    }

    function clickHandler(e, data) {
        console.log(data.data);
        setGraph(data.data);
    }


    /**
     * append callback function. append point
     * @param {Selection} enter 
     */
    function appendPoint(enter) {
        enter.append('circle').classed('point', true)
            .attr('cx', d => d.value.x)
            .attr('cy', d => d.value.y)
            .attr('r', 2)
    }

    /**
     * Update callback function. update point
     * @param {Selection} update 
     */
    function updatePoint(update) {
        
        update
            .attr('cx', d => d.value.x)
            .attr('cy', d => d.value.y)
        return;
    }

    /**
     * Exit callback function. exit point
     * @param {Selection} exit 
     */
    function removePoint(exit) {
        exit.remove();
    }

    /**
     * draw mid line, Merge border, and interestArea in the graph if they are provided.
     * @param {Selection} container 
     */
    function drawLines(container) {
        // remove exit dom
        container.selectAll('.splitLine').remove();
        container.selectAll('.mergeArea').remove();
        container.selectAll('.interestArea').remove();
        // draw split line
        if(graph.boundary !== null){
            container
            .append('line')
            .classed('splitLine', true)
            .attr('x1', graph.boundary.x)
            .attr('x2', graph.boundary.x)
            .attr('y1', 0)
            .attr('y2', 500)
            .attr('stroke', 'red');
        }
        // draw merge border
        if(graph.mergeArea.length !== 0){
            container.selectAll('.mergeArea').data(graph.mergeArea).join('line')
            .classed('mergeArea',true)
            .attr('x1', d=>d)
            .attr('x2', d=>d)
            .attr('y1', 0)
            .attr('y2', 500)
            .attr('stroke-dasharray', '11 11')
            .attr('stroke','blue');
        }
        // draw Interest Area
        if(graph.interestArea.length !== 0){
            container.selectAll('.interestArea').data(graph.interestArea).join('line')
            .classed('interestArea',true)
            .attr('x1', d=>d.x1)
            .attr('x2', d=>d.x2)
            .attr('y1', d=>d.y1)
            .attr('y2', d=>d.y2)
            .attr('stroke','yellow');
        }

        

    }

    /**
     * draw answer points and the line between them.
     * @param {Selection} container 
     */
    function drawAnswer(container){
        container.selectAll('.answer').remove();
        container.selectAll('.answerLine').remove();
        container.selectAll('.leftAnswer').remove();
        container.selectAll('.rightAnswer').remove();
        if(graph.answer.length === 2){
            container.selectAll('.answer').data(graph.answer).join('circle')
            .classed('answer', true)
            .attr('cx',d=>d.value.x)
            .attr('cy', d=>d.value.y)
            .attr('r',7)
            .attr('stroke','red')
            .attr('fill', 'none');
            // draw the line
            // container.selectAll('.answerLine').remove();
            container.append('line').classed('answerLine', true)
            .attr('x1', graph.answer[0].value.x)
            .attr('x2', graph.answer[1].value.x)
            .attr('y1', graph.answer[0].value.y)
            .attr('y2', graph.answer[1].value.y)
            .attr('stroke', 'green');
        }
        if(graph.leftAnswer.length === 2){
            container.selectAll('.leftAnswer').data(graph.leftAnswer).enter()
            .append('circle')
            .classed('answer', true)
            .attr('cx',d=>d.value.x)
            .attr('cy', d=>d.value.y)
            .attr('r',7)
            .attr('stroke', ()=>graph.childAns === 'left' ? 'green':'red')
            .attr('fill', 'none');
        }

        if(graph.rightAnswer.length === 2){
            container.selectAll('.rightAnswer').data(graph.rightAnswer).enter()
            .append('circle')
            .classed('answer', true)
            .attr('cx',d=>d.value.x)
            .attr('cy', d=>d.value.y)
            .attr('r',7)
            .attr('stroke', ()=>graph.childAns === 'right' ? 'green':'red')
            .attr('fill', 'none');
        }
    }

    function split() {
        let next = [];
        nodesPointer.forEach(tree => {
            if(tree.solved){
                return;
            }
            let treeValue = tree.elements;
            if (treeValue.length == 2) {
                tree.distance = getDistantce(treeValue[0].value, treeValue[1].value);
                tree.answer = [...tree.elements];
                tree.solved = true;
                return;
            }
            if(treeValue.length == 3){
                let distanceA = getDistantce(treeValue[0].value, treeValue[1].value);
                let distanceB = getDistantce(treeValue[0].value, treeValue[2].value);
                let distanceC = getDistantce(treeValue[1].value, treeValue[2].value);
                let min = Math.min(distanceA,distanceB,distanceC);
                if(min == distanceA){
                    tree.distance = distanceA;
                    tree.answer = [treeValue[0], treeValue[1]];
                }else if(min == distanceB){
                    tree.distance = distanceB;
                    tree.answer = [treeValue[0], treeValue[2]]
                }else{
                    tree.distance = distanceC;
                    tree.answer = [treeValue[1], treeValue[2]]
                }
                tree.solved = true;
                return;
            }
            let mid = Math.floor((0 + treeValue.length - 1) / 2);
            let leftChild = new PointNode(treeValue.slice(0, mid + 1), GetUniqueID(), tree);
            let rightChild = new PointNode(treeValue.slice(mid + 1, treeValue.length), GetUniqueID(), tree);
            // set split boundary (mid point)
            tree.setChild(leftChild);
            tree.setChild(rightChild);
            tree.boundary = treeValue[mid].value;
            next.push(leftChild);
            next.push(rightChild);
            setUpdate(update + 2);
            console.log(myTree);
        })
        setPointer(next);
        maxDepth.current = depth(myTree);
    }

    function solve() {
        let next = []
        nodesPointer.forEach(tree => {
            if (!tree.solved) {
                let treeValue = [...tree.elements];
                let result = getMinDistance(treeValue, 0, treeValue.length - 1);
                let pair = result[1];   
                tree.distance = result[0];             
                tree.answer = pair;
                tree.solved = true;
                next.push(tree);
            }
        })
        setPointer(next);
        setUpdate(update + 1);
        maxDepth.current = depth(myTree);

    }

    /**
     * Get the Distance between Point A and Point B
     * @param {{x:Integer, y:Integer}} pointA an Object that has x-coordination and y-coordination
     * @param {{x:Integer, y:Integer}} pointB an Object that has x-coordination and y-coordination
     * 
     * @returns {Number} the distance between point A and point B
     */
    function getDistantce(pointA, pointB) {
        let answer = Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
        return answer;
    }

    function getMinDistance(data, low, high) {
        // two points
        if (high - low == 1) {
            let answer = getDistantce(data[low].value, data[high].value);
            return [answer, [data[low], data[high]]];
        }
        // three points
        if (high - low == 2) {
            let distanceA = getDistantce(data[low].value, data[low + 1].value);
            let distanceB = getDistantce(data[low + 1].value, data[high].value);
            let distanceC = getDistantce(data[low].value, data[high].value);

            let min = Math.min(distanceA, distanceB, distanceC);
            if (min == distanceA) {
                return [min, [data[low], data[low + 1]]];
            } else if (min == distanceB) {
                return [min, [data[low + 1], data[high]]];
            } else {
                return [min, [data[low], data[high]]];
            }
        } else {
            let mid = Math.floor((low + high) / 2);
            let LeftPart = getMinDistance(data, low, mid);
            let RightPart = getMinDistance(data, mid + 1, high);
            let bound = Math.min(LeftPart[0], RightPart[0]);
            let midX = data[mid].value.x;
            let LeftX = midX - bound;
            let RightX = midX + bound;
            let candiate = [];
            let points = bound == LeftPart[0] ? LeftPart[1] : RightPart[1];

            for (let i = mid; i >= 0; i--) {
                if (data[i].value.x > LeftX) {
                    candiate.push(data[i]);
                }
            }

            for (let i = mid + 1; i <= high; i++) {
                if (data[i].value.x < RightX) {
                    candiate.push(data[i]);
                }
            }
            candiate = sortPoints(candiate, 'y');

            for (let i = 0; i < candiate.length - 1; i++) {
                if (candiate[i].value.y - candiate[i + 1].value.y >= bound) {
                    continue;
                }
                let temp = getDistantce(candiate[i].value, candiate[i + 1].value);
                if (temp < bound) {
                    bound = temp;
                    points = [candiate[i], candiate[i + 1]];
                }
            }
            return [bound, points];
        }
    }

    function createInterestArea(node){
        
    }

    /**
     * draw child answer on the parent graph
     * @param {PointNode} node 
     * @param {{key:String, value:{x:Number, y:Number}}} left 
     * @param {{key:String, value:{x:Number, y:Number}}} right 
     */
    function drawChildAns(node, left, right){
        node.leftAnswer = left;
        node.rightAnswer = right;
    }

    /**
     * @param {PointNode} node Parent Node 
     * @param {Number} left closet distance of pair of left part
     * @param {Number} right closet distance of pair of right part  
     */
    function selectChild(node,left, right){
        let min = Math.min(left, right);
        if(min === left){
            node.childAns = 'left';
        }else{
            node.childAns = 'right';
        }
        return min;
    }


    function drawMergeLine(node, left, right){
        let bound = selectChild(node, left,right);
        let leftX = Math.floor(node.boundary.x - bound);
        let rightX = Math.floor(node.boundary.x + bound);
        node.mergeArea = [leftX, rightX];
    }

    /**
     * initialize action Queue of one parent node. Those actions are 'create Interest Area', 'Iterate search possible pair of point'
     * , and 'return final answer', 'remove child node';
     * @param {PointNode} node 
     * @returns {ActionQueue} 
     */
    function getActionQueue(node){
        let queue = new ActionQueue();
        let leftPart = node.children[0];
        let rightPart = node.children[1];
        
        queue.push(new Action('drawAnswer', [node, leftPart.answer, rightPart.answer],drawChildAns))
        queue.push(new Action('MarkAnswer', [node, leftPart.distance, rightPart.distance], selectChild))
        queue.push(new Action('mergeLine', [node, leftPart.distance, rightPart.distance], drawMergeLine))
        return queue;
    }

    
    
    function mergeOne(){
        let head;
        let value;
        let parent;
        let child;
        console.log(mergeQueue.current)
        if (mergeQueue.current.length == 0) {
          mergeQueue.current = splitByParentID(getNodesAt(myTree, maxDepth.current));
        }
        console.log(mergeQueue.current);
        head = mergeQueue.current.at(0); // get queue head;
        parent = head[0].parent // get parent reference;
        if(graph === undefined || graph.id !== parent.id){
            setGraph(parent);
        }
        if(parent.actionQueue === null){
            parent.actionQueue = getActionQueue(parent);
        }

        if(parent.actionQueue.length !== 0){
            parent.actionQueue.pop();
        }
        setUpdate(update + 1);
        
    }


    return (
        <div className='ClosetPoint'>
            <div id='svgContainer' ref={selfRef}>
                <svg className='animationArea' width={500} height={500} style={{ border: "1px solid green" }}>
                    <g>

                    </g>
                </svg>

                <svg className='DetailArea' width={500} height={500} style={{ border: "1px solid green" }}>
                    <g>

                    </g>
                </svg>

            </div>
            <div>
                <button onClick={split}>
                    Split
                </button>
                <button onClick={solve}>Solve</button>
                <button disabled={mergeBtnOff} onClick={mergeOne}>Merge</button>
                <button disabled={mergeBtnOff}>Old fansion</button>
            </div>


        </div>

    )
}
