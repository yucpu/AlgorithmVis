import React, { useEffect, useRef, useState } from 'react';
import { select, tree, linkVertical, hierarchy, transition, easeLinear, Selection, } from 'd3';
import { treeNode, GetUniqueID, splitNArray, getNodesAt, depth, splitByParentID, pointGenerator, sortPoints, addPointAttrs, isEqualPoint } from './util';

const data = pointGenerator(500, 30);

export default function ClosetPoint() {
    let selfRef = useRef();
    let myTree = useRef(new treeNode(data, GetUniqueID(), null)).current;
    //addPointAttrs(myTree, 'answer', []);
    // addPointAttrs(myTree, 'boundary', null);

    let [graph, setGraph] = useState();
    const nodeTransition = transition().duration(200).ease(easeLinear);
    let mergeQueue = useRef([]);
    let maxDepth = useRef(depth(myTree));
    let [update, setUpdate] = useState(1);
    let [selected, setSelect] = useState([]);
    let [nodesPointer, setPointer] = useState([myTree]);
    let [zoomState, setZoom] = useState({ k: 1, x: 0, y: 10 });
    let [mergeBtnOff, setMergeBtn] = useState(true);

    useEffect(() => {
        addPointAttrs(myTree, 'answer', []);
        addPointAttrs(myTree, 'boundary', null);
    }, [])

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
            if (graph.boundary !== null) {
                drawMid(container);
            }else{
                container.selectAll('.splitLine').remove();
            }
            if(graph.answer.length == 2){
                container.selectAll('.answer').data(graph.answer).join('circle')
                .classed('answer', true)
                .attr('cx',d=>d.value.x)
                .attr('cy', d=>d.value.y)
                .attr('r',4)
                .attr('fill','red');
            }else{
                container.selectAll('.answer').remove();
            }
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
            .attr('r', 4)
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
     * draw mid line in the graph
     * @param {Selection} container 
     */
    function drawMid(container) {
        container.selectAll('.splitLine').remove();
        container
            .append('line')
            .classed('splitLine', true)
            .attr('x1', graph.boundary.x)
            .attr('x2', graph.boundary.x)
            .attr('y1', 0)
            .attr('y2', 500)
            .attr('stroke', 'red');

    }

    function split() {

        let next = [];
        nodesPointer.forEach(tree => {
            if(tree.solved){
                return;
            }
            let treeValue = tree.elements;
            
            if (treeValue.length == 2) {
                addPointAttrs(tree, 'answer', [...tree.elements]);
                tree.elements = [];
                tree.solved = true;
                return;
            }
            if(treeValue.length == 3){
                let distanceA = getDistantce(treeValue[0].value, treeValue[1].value);
                let distanceB = getDistantce(treeValue[0].value, treeValue[2].value);
                let distanceC = getDistantce(treeValue[1].value, treeValue[2].value);
                let min = Math.min(distanceA,distanceB,distanceC);
                
                if(min == distanceA){
                    tree.elements = [treeValue[2]];
                    addPointAttrs(tree, 'answer', [treeValue[0], treeValue[1]]);
                }else if(min == distanceB){
                    tree.elements = [treeValue[1]];
                    addPointAttrs(tree, 'answer', [treeValue[0], treeValue[2]]);
                }else{
                    tree.elements = [treeValue[0]];
                    addPointAttrs(tree, 'answer', [treeValue[1], treeValue[2]]);
                }
                tree.solved = true;
                return;
            }
            let mid = Math.floor((0 + treeValue.length - 1) / 2);
            let leftChild = new treeNode(treeValue.slice(0, mid + 1), GetUniqueID(), tree);
            addPointAttrs(leftChild, 'answer', []);
            addPointAttrs(leftChild, 'boundary', null);
            let rightChild = new treeNode(treeValue.slice(mid + 1, treeValue.length), GetUniqueID(), tree);
            addPointAttrs(rightChild, 'answer', []);
            addPointAttrs(rightChild, 'boundary', null);
            // set split boundary (mid point)
            tree.setChild(leftChild);
            tree.setChild(rightChild);
            addPointAttrs(tree, 'boundary', treeValue[mid].value)
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
                let pair = result[1]
                let count = 0;
                
                for(let i = treeValue.length - 1; i >=0; i-- ){
                    if(pair[0].key === treeValue[i].key){
                        treeValue.splice(i,1);
                        count += 1;
                        continue;
                    }
                    if(pair[1].key === treeValue[i].key){
                        treeValue.splice(i,1);
                        count += 1;
                        continue;
                    }
                    if(count == 2){
                        break;
                    }
                }
                
                addPointAttrs(tree, 'answer', pair);
                tree.elements = treeValue;
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
        setGraph(parent);
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
