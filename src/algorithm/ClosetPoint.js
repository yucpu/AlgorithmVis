import React, { useEffect, useRef, useState } from 'react';
import { select, tree, linkVertical, hierarchy, transition, easeLinear, Selection, } from 'd3';
import { GetUniqueID, getNodesAt, depth, splitByParentID, pointGenerator, sortPoints } from '../Util/util';
import PointNode from '../Util/PointNode';
import ActionQueue from '../Util/ActionQueue';
import Action from '../Util/Action';
import { Button } from '@mui/material';
import { Steps} from 'intro.js-react';
import "intro.js/introjs.css";
// 
const staticData = [
    {
        "key": "key164393",
        "value": {
            "x": 164,
            "y": 393
        }
    },
    {
        "key": "key179195",
        "value": {
            "x": 179,
            "y": 195
        }
    },
    {
        "key": "key181340",
        "value": {
            "x": 181,
            "y": 340
        }
    },
    {
        "key": "key213454",
        "value": {
            "x": 213,
            "y": 454
        }
    },
    {
        "key": "key245259",
        "value": {
            "x": 245,
            "y": 259
        }
    },
    {
        "key": "key246279",
        "value": {
            "x": 246,
            "y": 279
        }
    },
    {
        "key": "key297294",
        "value": {
            "x": 297,
            "y": 294
        }
    },
    {
        "key": "key308183",
        "value": {
            "x": 308,
            "y": 183
        }
    },
    {
        "key": "key404106",
        "value": {
            "x": 404,
            "y": 106
        }
    },
    {
        "key": "key446234",
        "value": {
            "x": 446,
            "y": 234
        }
    }]

const tours = [
    {
        element: ".animationArea",
        intro: "In this problem, we are given a set of pairs of points in 2-Dimension. The intuitive approach is to compare the distance between all combinations of points and then find the closest pair. However, there is a more efficient way to tackle this task. Let's explore our approach and enjoy the process!"
    },
    {
        element: '.animationArea',
        intro: "This panel is used to display a tree layout that shows the particular state of the algorithm. Each node represents a partial problem of the original one."
    },
    {
        element : ".DetailArea",
        intro: "This panel is used to display a graph inside a particualr node. you can click a node in left panel. Then you can inspect graph in this panel."
    },
    {
        element:".divide",
        intro: "This is a High-level Button that is used to split Current problem"
    },
    {
        element:".conquer",
        intro: "This is a High-level Button that is used to solve current problem directly"
    },
    {
        element:".merge",
        intro: "This is a High-level Button that is used to merge solutions you got"
    },
    {
        element:".next",
        intro: "This is a Low-level Button that is used to inspect the detailed steps of merge"
    },
    {
        element:".restart",
        intro: "This button is used to restart the animation. You can watch the visualization again if you want"
    }
]

export default function ClosetPoint() {
    let selfRef = useRef();
    let data = useRef(staticData).current;
    let myTree = useRef(new PointNode(data, GetUniqueID(), null)).current;
    let stateStack = useRef([]).current;
    let [graph, setGraph] = useState(myTree);
    const nodeTransition = transition().duration(200).ease(easeLinear);
    let mergeQueue = useRef([]);
    let maxDepth = useRef(depth(myTree));
    let [update, setUpdate] = useState(1);
    //let [selected, setSelect] = useState([]);
    let [nodesPointer, setPointer] = useState([myTree]);
    //let [zoomState, setZoom] = useState({ k: 1, x: 0, y: 10 });
    let [mergeBtnOff, setMergeBtn] = useState(true);
    let [guide, setGuide] = useState(tours);
    let [stepsEnabled, setStep] = useState(true); 


    function restart() {
        myTree.reset();
        maxDepth.current = depth(myTree);
        setMergeBtn(true);
        setPointer([myTree]);
        setUpdate(1);
        setGraph(myTree);
    }

    function back() {
        console.log(stateStack);
        if (stateStack.length === 0) {
            console.log("state Stack is Empty");
            return;
        }
        let state;
        do {
            state = stateStack.pop();
            state.rollback();
        } while (state.target === null);

        state.rollback();
        if (state.target !== null) {
            setGraph(state.target);
        }
        maxDepth.current = depth(myTree);
        setUpdate(update + 1);
    }


    useEffect(() => {
        if (maxDepth.current != 0) {
            setMergeBtn(!getNodesAt(myTree, maxDepth.current).every(tree => tree.solved))
        }
    }, [maxDepth.current, update])

    useEffect(() => {
        const container = select(selfRef.current).select('.animationArea').select('g');
        const d3treeLayout = tree().size([500, 200]);
        const linkGenerator = linkVertical().source(d => sourceRefine(d)).target(d => [d.target.x, d.target.y - 10]);
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

        } else {
            container.selectAll('.point').remove();
            container.selectAll('line').remove();
        }
    }, [graph, update])




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
            .attr('stroke', d => d.data.solved ? 'green' : 'red');
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
        if (graph.boundary !== null) {
            container
                .append('line')
                .classed('splitLine', true)
                .attr('x1', graph.boundary.x)
                .attr('x2', graph.boundary.x)
                .attr('y1', 0)
                .attr('y2', 500)
                .attr('stroke', 'red')
                .attr('stroke-dasharray', '11 11');
        }
        // draw merge border
        if (graph.mergeArea.length !== 0) {
            container.selectAll('.mergeArea').data(graph.mergeArea).join('line')
                .classed('mergeArea', true)
                .attr('x1', d => d)
                .attr('x2', d => d)
                .attr('y1', 0)
                .attr('y2', 500)
                .attr('stroke-dasharray', '11 11')
                .attr('stroke', 'blue');
        }
        // draw Interest Area
        if (graph.interestArea.length !== 0) {
            container.selectAll('.interestArea').data(graph.interestArea).join('line')
                .classed('interestArea', true)
                .attr('x1', d => d.x1)
                .attr('x2', d => d.x2)
                .attr('y1', d => d.y1)
                .attr('y2', d => d.y2)
                .attr('stroke', 'purple')
                .attr('stroke-dasharray', '6 6');
        }



    }

    /**
     * draw answer points and the line between them.
     * @param {Selection} container 
     */
    function drawAnswer(container) {
        // container.selectAll('.answer').remove();
        container.selectAll('.answerLine').remove();
        container.selectAll('.leftAnswer').remove();
        container.selectAll('.rightAnswer').remove();
        if (graph.answer.length === 2) {

            container.append('line').classed('answerLine', true)
                .attr('x1', graph.answer[0].value.x)
                .attr('x2', graph.answer[1].value.x)
                .attr('y1', graph.answer[0].value.y)
                .attr('y2', graph.answer[1].value.y)
                .attr('stroke', '#e6005c')
                .attr('stroke-width', 2);
        }
        if (graph.leftAnswer.length === 2) {

            container.append('line').classed('answerLine', true)
                .attr('x1', graph.leftAnswer[0].value.x)
                .attr('x2', graph.leftAnswer[1].value.x)
                .attr('y1', graph.leftAnswer[0].value.y)
                .attr('y2', graph.leftAnswer[1].value.y)
                .attr('stroke', () => graph.childAns === 'left' ? '#00cc00' : 'black')
                .attr('stroke-width', () => graph.childAns === 'left' ? '3' : '2');
        }

        if (graph.rightAnswer.length === 2) {
            container.append('line').classed('answerLine', true)
                .attr('x1', graph.rightAnswer[0].value.x)
                .attr('x2', graph.rightAnswer[1].value.x)
                .attr('y1', graph.rightAnswer[0].value.y)
                .attr('y2', graph.rightAnswer[1].value.y)
                .attr('stroke', () => graph.childAns === 'right' ? '#00cc00' : 'black')
                .attr('stroke-width', 2);;
        }

        if (graph.possibleAnswer.length === 2) {
            container.append('line').classed('answerLine', true)
                .attr('x1', graph.possibleAnswer[0].value.x)
                .attr('x2', graph.possibleAnswer[1].value.x)
                .attr('y1', graph.possibleAnswer[0].value.y)
                .attr('y2', graph.possibleAnswer[1].value.y)
                .attr('stroke', '#00cccc')
                .attr('stroke-width', 2);;
        }
    }

    function selfCheck(tree) {
        let treeValue = tree.elements;
        if (treeValue.length == 2) {
            tree.distance = getDistantce(treeValue[0].value, treeValue[1].value);
            tree.answer = [...tree.elements];
            tree.solved = true;
            return;
        }
        if (treeValue.length == 3) {
            let distanceA = getDistantce(treeValue[0].value, treeValue[1].value);
            let distanceB = getDistantce(treeValue[0].value, treeValue[2].value);
            let distanceC = getDistantce(treeValue[1].value, treeValue[2].value);
            let min = Math.min(distanceA, distanceB, distanceC);
            if (min == distanceA) {
                tree.distance = distanceA;
                tree.answer = [treeValue[0], treeValue[1]];
            } else if (min == distanceB) {
                tree.distance = distanceB;
                tree.answer = [treeValue[0], treeValue[2]]
            } else {
                tree.distance = distanceC;
                tree.answer = [treeValue[1], treeValue[2]]
            }
            tree.solved = true;
            return;
        }
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
                if (Math.abs(candiate[i].value.y - candiate[i + 1].value.y) >= bound) {
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

    /**
     * draw child answer on the parent graph
     * @param {PointNode} node 
     * @param {{key:String, value:{x:Number, y:Number}}} left 
     * @param {{key:String, value:{x:Number, y:Number}}} right 
     */
    function drawChildAns(node, left, right) {
        node.leftAnswer = left;
        node.rightAnswer = right;
    }

    /**
     * @param {PointNode} node Parent Node 
     * @param {String} decision The part that has closet pair of points.
     */
    function selectChild(node, decision) {
        node.childAns = decision;
    }

    /**
     * Using two line to draw the merge area around the split line
     * @param {PointNode} node Parent Node 
     * @param {Number} bound The closet distance in the sub-part area
     */
    function drawMergeLine(node, Interval) {
        node.mergeArea = Interval;
    }

    /**
     * draw the interest Area on the merge area.
     * @param {Array} points 
     */
    function drawInterestArea(node, points) {
        let lines = [];

        let Xs = points.map(item => item.value.x);
        let Ys = points.map(item => item.value.y);
        let highestX = Math.max(...Xs) + 4;
        let highestY = Math.max(...Ys) + 4;
        let lowestX = Math.min(...Xs) - 4;
        let lowestY = Math.min(...Ys) - 4;
        lines.push({ x1: highestX, y1: highestY, x2: highestX, y2: lowestY });
        lines.push({ x1: highestX, y1: lowestY, x2: lowestX, y2: lowestY });
        lines.push({ x1: lowestX, y1: lowestY, x2: lowestX, y2: highestY });
        lines.push({ x1: lowestX, y1: highestY, x2: highestX, y2: highestY });

        node.interestArea = lines;
    }

    function selectAnswer(node, pointA, pointB) {
        let distance = getDistantce(pointA.value, pointB.value);
        node.possibleAnswer = [pointA, pointB];
        if (node.distance > distance) {
            node.closet = [pointA, pointB];
            node.answer = [pointA, pointB];
            node.distance = distance;
        }
    }

    function confirmAnswer(node, distance) {
        node.possibleAnswer = [];
        if (node.distance < distance) {
            node.answer = node.closet;
        }
        if (node.answer.length === 0 || node.distance > distance) {
            node.answer = node.childAns === 'left' ? node.leftAnswer : node.rightAnswer;
            node.distance = distance;
        }
        node.boundary = null;
        node.leftAnswer = [];
        node.rightAnswer = [];
        node.interestArea = [];
        node.mergeArea = [];
        node.childAns = 'none';
        node.solved = true;

    }

    /**
     * initialize action Queue of one parent node. Those actions are 'create Interest Area', 'Iterate search possible pair of point'
     * , and 'return final answer', 'remove child node';
     * @param {PointNode} node 
     * @returns {ActionQueue} 
     */
    function getActionQueue(node) {
        let queue = new ActionQueue();
        let leftPart = node.children[0];
        let rightPart = node.children[1];
        let leftAnswer = leftPart.distance;
        let rightAnswer = rightPart.distance;
        let minDistance = Math.min(leftAnswer, rightAnswer);
        let mark = leftAnswer < rightAnswer ? "left" : "right";
        let leftX = Math.floor(node.boundary.x - minDistance);
        let rightX = Math.floor(node.boundary.x + minDistance);
        let possibleAnswer = leftPart.elements.filter(item => item.value.x > leftX);
        possibleAnswer = possibleAnswer.concat(rightPart.elements.filter(item => item.value.x < rightX));
        possibleAnswer = sortPoints(possibleAnswer, 'y');
        for (let i = possibleAnswer.length - 1; i >= 1; i--) {
            if (Math.abs(possibleAnswer[i].value.y - possibleAnswer[i - 1].value.y) >= minDistance) {
                possibleAnswer.splice(i, 1);
            }
        }
        for (let i = 0; i < possibleAnswer.length - 1; i++) {
            if (Math.abs(possibleAnswer[i].value.y - possibleAnswer[i + 1].value.y) >= minDistance) {
                possibleAnswer.splice(i, 1);
            }
        }

        queue.push(new Action('drawAnswer', [node, leftPart.answer, rightPart.answer], drawChildAns))
        queue.push(new Action('MarkAnswer', [node, mark], selectChild))
        queue.push(new Action('mergeLine', [node, [leftX, rightX]], drawMergeLine))
        queue.push(new Action('drawInterestArea', [node, possibleAnswer], drawInterestArea))
        for (let i = 0; i < possibleAnswer.length - 1; i++) {
            for (let j = i + 1; j < possibleAnswer.length; j++) {

                queue.push(new Action('iterateAnswers', [node, possibleAnswer[i], possibleAnswer[j]], selectAnswer))
            }
        }
        queue.push(new Action('confirm', [node, minDistance], confirmAnswer))
        return queue;
    }

    function split() {
        let next = [];
        nodesPointer.forEach(tree => {
            if (tree.solved) {
                return;
            }
            // stateStack.push(new TreeState(tree, Object.entries(tree)));
            let treeValue = tree.elements;
            let mid = Math.floor((0 + treeValue.length - 1) / 2);
            let leftChild = new PointNode(treeValue.slice(0, mid + 1), GetUniqueID(), tree);
            let rightChild = new PointNode(treeValue.slice(mid + 1, treeValue.length), GetUniqueID(), tree);
            selfCheck(leftChild);
            selfCheck(rightChild);
            // set split boundary (mid point)
            tree.setChild(leftChild);
            tree.setChild(rightChild);
            tree.boundary = treeValue[mid].value;
            next.push(leftChild);
            next.push(rightChild);
            setUpdate(update + 2);

        })
        // stateStack.push(new TreeState(null, null, nodesPointer, setPointer));
        setPointer(next);
        maxDepth.current = depth(myTree);
    }

    function solve() {
        let next = []
        nodesPointer.forEach(tree => {
            if (tree.solved) {
                return;
            }
            // stateStack.push(new TreeState(tree, Object.entries(tree))); // record state
            let treeValue = [...tree.elements];
            let result = getMinDistance(treeValue, 0, treeValue.length - 1);
            let pair = result[1];
            tree.distance = result[0];
            tree.answer = pair;
            tree.solved = true;
            next.push(tree);
        })
        // stateStack.push(new TreeState(null, null, nodesPointer, setPointer));
        setPointer(next);
        setUpdate(update + 1);
        maxDepth.current = depth(myTree);

    }

    /**
     * Merge Answer in detail style
     */
    function mergeOne() {
        let head;
        let parent;
        if (mergeQueue.current.length == 0) {
            mergeQueue.current = splitByParentID(getNodesAt(myTree, maxDepth.current));
        }
        head = mergeQueue.current.at(0); // get queue head;
        parent = head[0].parent // get parent reference;
        if (graph === undefined || graph.id !== parent.id) {
            setGraph(parent);
        }
        if (parent.actionQueue === null) {
            parent.actionQueue = getActionQueue(parent);
        }
        if (parent.actionQueue.length !== 0) {
            parent.actionQueue.pop();
        }
        if (parent.solved) {
            parent.children = [];
            mergeQueue.current.shift();
        }
        if (mergeQueue.current.length == 0) {
            maxDepth.current -= 1;
        }
        if (maxDepth.current == 0) {
            setMergeBtn(true);
        }
        setUpdate(update + 1);
    }

    /**
     * Merge answer in high-level way
     */
    function Merge() {
        let head;
        let parent;
        if (mergeQueue.current.length == 0) {
            mergeQueue.current = splitByParentID(getNodesAt(myTree, maxDepth.current));
        }
        head = mergeQueue.current.at(0); // get queue head;
        parent = head[0].parent // get parent reference;
        // if (graph === undefined || graph.id !== parent.id) {
        //     setGraph(parent);
        // }
        if (parent.actionQueue === null) {
            stateStack.push(parent, Object.entries(parent));
            parent.actionQueue = getActionQueue(parent);
        }
        while (parent.actionQueue.length !== 0) {
            parent.actionQueue.pop();
        }

        if (parent.solved) {
            parent.children = [];
            setGraph(parent);
            mergeQueue.current.shift();
        }
        if (mergeQueue.current.length == 0) {
            maxDepth.current -= 1;
        }
        if (maxDepth.current == 0) {
            setMergeBtn(true);
        }
        setUpdate(update + 1);

    }




    return (
        <div className='App'>
            <Steps
                enabled={stepsEnabled}
                steps={guide}
                initialStep={0}
                onExit={()=>{setStep(false)}}
            >

            </Steps>
            <div id='svgContainer' ref={selfRef}>
                <svg className='animationArea' width={500} height={500} style={{ border: "1px solid green" }}>
                    <g transform='translate(0, 10)'>

                    </g>
                </svg>

                <svg className='DetailArea' width={500} height={500} style={{ border: "1px solid green" }}>
                    <g>

                    </g>
                </svg>

            </div>
            <div>
                <Button className='divide' onClick={split}>
                    Divide
                </Button>
                <Button className='conquer' onClick={solve}>Conquer</Button>
                <Button className='merge' disabled={mergeBtnOff} onClick={Merge}>Merge</Button>
                <Button className='next' disabled={mergeBtnOff} onClick={mergeOne}>Next</Button>
                <Button className='restart' onClick={restart}> Restart</Button>
                {/* <Button onClick={back}>Back</Button> */}
            </div>


        </div>

    )
}
