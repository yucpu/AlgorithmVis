import React, { forwardRef, useEffect, useImperativeHandle, useRef} from 'react'
import {select, hierarchy, tree, linkVertical} from 'd3';
import AArray from './AArray';

const ATree = forwardRef((props, ref) => {
    let svgWidth = props.width || 0;
    let svgHeight = props.height || 0;
    let treeRef = useRef(null);

    let data = {
        name: '中国',
        children: [
          {
            name: '浙江',
            children: [
              { name: '杭州', value: 100 },
              { name: '宁波', value: 200 },
              { name: '温州', value: 30 },
              { name: '绍兴', value: 50 },
            ],
          },
          {
            name: '广西',
            children: [
              {
                name: '桂林',
                children: [
                  { name: '秀峰区', value: 20 },
                  { name: '叠彩区', value: 130 },
                  { name: '象山区', value: 140 },
                  { name: '七星区', value: 10 },
                ],
              },
              { name: '南宁', value: 90 },
              { name: '柳州', value: 88 },
              { name: '防城港', value: 99 },
            ],
          },
          {
            name: '黑龙江',
            children: [
              { name: '哈尔滨', value: 54 },
              { name: '齐齐哈尔', value: 2 },
              { name: '牡丹江', value: 42 },
              { name: '大庆', value: 43 },
            ],
          },
          {
            name: '新疆',
            children: [
              { name: '乌鲁木齐', value: 1 },
              { name: '克拉玛依', value: 10 },
              { name: '吐鲁番', value: 23 },
              { name: '哈密', value: 43 },
            ],
          },
        ],
    }

    useEffect(()=>{
        const svgElement = select(treeRef.current);
        const root = hierarchy(data);
        const treeLayout = tree().size([svgWidth, svgHeight]);
        const linkGenerator = linkVertical().x(node=>node.x).y(node=>node.y);
        treeLayout(root);
        
        svgElement.selectAll(".node")
        .data(root.descendants())
        .join(enter=>enter.append("circle").attr("cx", d => d.x).attr("cy", d=>d.y).attr("r",5).attr("fill","black"),
          update=>update,
          exit=>exit)
        .classed("node",true)
       
        svgElement.selectAll(".link").data(root.links())
        .join(enter=>enter.append("path").classed("link",true).attr("fill","none").attr("stroke","black").attr("d", linkGenerator),
          update=>update,
          exit=>exit)
        
    },[data])

    useImperativeHandle(ref, () => ({
        hello: (info) => { console.log("Hello" + info) },

    }))

    return (
        <svg width={svgWidth} height={svgHeight} ref={treeRef} style={{border:"2px solid black"}}>
            ATree
        </svg>
    )
})

export default ATree