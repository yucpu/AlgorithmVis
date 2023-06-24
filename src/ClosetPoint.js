import React, { useEffect, useRef, useState } from 'react';
import { treeNode, pointGenerator, GetUniqueID } from './util';
import { select, tree, linkVertical, hierarchy, zoom, zoomTransform, transition, easeLinear, Selection, } from 'd3';

const data = pointGenerator(500, 30);

const myTree = new treeNode(data, GetUniqueID(), null);

export default function ClosetPoint() {
    let selfRef = useRef();
    let [graph, setGraph] = useState();


    useEffect(() => {
        const container = select(selfRef.current).select('.animationArea').select('g');
        const d3treeLayout = tree().size([500, 200]);
        const linkGenerator = linkVertical().source(d => sourceRefine(d));
        const root = hierarchy(myTree);
        d3treeLayout(root);
        console.log(root.descendants())
        drawNode(container, root.descendants());
        


    }, [])

    
    /**
     * draw hierarchy node
     * @param {Selection} container d3 selection
     * @param {hierarchy} dataset d3 Node
     */
    function drawNode(container, dataset){
        container.selectAll('.gnode')
        .data(dataset)
        .join(appendNode, updateNode, removeNode);
    }

    /**
     * append callback function
     * @param {Selection} enter d3 selection
     */
    function appendNode(enter){
        enter.append('g').classed('gnode',true)
        .append('circle')
        .attr('cx', d=>d.x)
        .attr('cy', d=>d.y)
        .attr('r', 10)
        .on('click', (event, data)=>{clickHandler(event, data)})
        
    }

    function updateNode(update){
        return;

    }

    function removeNode(exit){
        return exit.remove();
    }

    function sourceRefine(node) {
        let sourceX = node.source.x;
        let sourceY = node.source.y + 20;
        return [sourceX, sourceY];
    }

    function clickHandler(e, data){
        setGraph(data);
    }




    return (
        <div className='ClosetPoint' ref={selfRef}>
            <svg className='animationArea' width={500} height={500} style={{ border: "1px solid green" }}>
                <g>

                </g>
            </svg>



        </div>

    )
}
