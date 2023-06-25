import React, { useEffect, useRef, useState } from 'react';
import { select, tree, linkVertical, hierarchy, zoom, zoomTransform, transition, easeLinear, Selection, } from 'd3';
import { treeNode, GetUniqueID, splitNArray, getNodesAt, refinement, depth, splitByParentID, pointGenerator } from './util';

const data = pointGenerator(500, 30);

export default function ClosetPoint() {
    let selfRef = useRef();
    let myTree = useRef(new treeNode(data, GetUniqueID(), null)).current;
    let [graph, setGraph] = useState([]);
    const nodeTransition = transition().duration(200).ease(easeLinear);
    let mergeQueue = useRef([]);
    let maxDepth = useRef(depth(myTree));
    let [update, setUpdate] = useState(1);
    let [selected, setSelect] = useState([]);
    let [nodesPointer, setPointer] = useState([myTree]);
    let [zoomState, setZoom] = useState({ k: 1, x: 0, y: 10 });
    let [mergeBtnOff, setMergeBtn] = useState(true);

    useEffect(() => {
        const container = select(selfRef.current).select('.animationArea').select('g');
        const d3treeLayout = tree().size([500, 200]);
        const linkGenerator = linkVertical().source(d => sourceRefine(d)).target(d=>[d.target.x, d.target.y]);
        const root = hierarchy(myTree);
        d3treeLayout(root);
        console.log(root.descendants())
        drawNode(container, root.descendants());

        drawLinks(container, root.links(), linkGenerator);
        console.log(root.descendants())

    }, [update])

    useEffect(()=>{
        const container = select(selfRef.current).select('.DetailArea').select('g');
        console.log(graph);
        container.selectAll('.point').data(graph).join(appendPoint,updatePoint,removePoint);
        //container.selectAll('g').data(graph).join(enter=>{enter.append('circle').attr('cx', d=>d.x).attr('cy', d=>d.y).attr('r',3)}, update=>update, exit=>exit.remove)

    },[graph])


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
            .attr('transform', d=>`translate(${d.x}, ${d.y})`)
            .append('circle')
            .attr('r', 10)
            .attr('fill', 'white')
            .attr('stroke', 'green')
            .on('click', (event, data) => { clickHandler(event, data) })

    }

    function updateNode(update) {
        update.attr('transform', d=>`translate(${d.x}, ${d.y})`);
        return;

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
            .join((enter) => {appendLink(enter, linkGenerator)},(update)=>{updateLink(update, linkGenerator)}, removeLink)
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
    function updateLink(update ,linkGenerator) {
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
        
        setGraph(data.data.elements);
    }


    /**
     * append callback function. append point
     * @param {Selection} enter 
     */
    function appendPoint(enter){
        enter.append('circle').classed('point',true)
        .attr('cx', d=>d.value.x)
        .attr('cy',d=>d.value.y)
        .attr('r',3);
    }

    /**
     * Update callback function. update point
     * @param {Selection} update 
     */
    function updatePoint(update){
        update
        .attr('cx', d=>d.value.x)
        .attr('cy',d=>d.value.y)
        return;
    }

    /**
     * Exit callback function. exit point
     * @param {Selection} exit 
     */
    function removePoint(exit){
        exit.remove();
    }


    function split() {
        let next = [];
        nodesPointer.forEach(tree => {
            if (tree.sorted) {
                return;
            }
            // tree: Target Tree needed to be splited into smaller chunks
            // treeValue: tree.elements
            let treeValue = tree.elements;
            // split elements into n parts
            let chunks = splitNArray(treeValue, 2);
            for (let i = 0; i < chunks.length; i++) {
                let childTree = new treeNode(chunks[i], GetUniqueID(), tree);
                tree.setChild(childTree);
                next.push(childTree);
            }
            setUpdate(update + chunks.length);
        })
        setPointer(next);
        maxDepth.current = depth(myTree);
    }


    return (
        <div className='ClosetPoint'>
            <div id='svgContainer' ref={selfRef}>
                <svg className='animationArea' width={500} height={500} style={{ border: "1px solid green" }}>
                    <g>

                    </g>
                </svg>

                <svg className='DetailArea' width={500} height={500} style={{border: "1px solid green"}}>
                    <g>

                    </g>
                </svg>

            </div>
            <div>
                <button onClick={split}>
                    Split
                </button>
                <button >Solve</button>
                <button disabled={mergeBtnOff}>Merge</button>
                <button disabled={mergeBtnOff}>Old fansion</button>
            </div>


        </div>

    )
}
