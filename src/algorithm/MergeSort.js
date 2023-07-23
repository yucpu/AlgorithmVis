import { useEffect, useReducer, useRef, useState } from 'react';
import { select, tree, linkVertical, hierarchy, zoom, zoomTransform, transition, easeLinear, zoomIdentity, } from 'd3';
import './App.css';
import { GetUniqueID, splitNArray, getNodesAt, refinement, depth, splitByParentID} from '../Util/util';
import treeNode from '../Util/treeNode';
import { Button } from '@mui/material';


const data = [{ key: "key3", value: 3 },
{ key: "key2", value: 2 },
{ key: "key9", value: 1 },
{ key: "key4", value: 4 },
{ key: "key19", value: 19 },
{ key: "key12", value: 12 },
{ key: "key14", value: 14 },
{ key: "key13", value: 13 },
{ key: "key11", value: 11 },];





function MergeSort() {
  const selfRef = useRef(null);
  let myTree = useRef(new treeNode(data, GetUniqueID(), null)).current;
  const nodeTransition = transition().duration(200).ease(easeLinear);
  let mergeQueue = useRef([]);
  let maxDepth = useRef(depth(myTree));
  let [update, setUpdate] = useState(1);
  let [selected, setSelect] = useState([]);
  let [nodesPointer, setPointer] = useState([myTree]);
  let [zoomState, setZoom] = useState({ k: 1, x: 0, y: 0 });
  let [mergeBtnOff, setMergeBtn] = useState(true);



  useEffect(()=>{
    if(maxDepth.current != 0){
      setMergeBtn(!getNodesAt(myTree, maxDepth.current).every(tree => tree.solved))
    }
  },[maxDepth.current, update])

  useEffect(() => {
    const app = select(selfRef.current);
    const svg = app.select("svg");
    const svgZoom = zoom().on("zoom", () => { zoomHandler(svg) });
    const d3treeLayout = tree().size([500, 200]);
    const linkGenerator = linkVertical().source(d => sourceRefine(d)).target(d => targetRefine(d));
    const root = hierarchy(myTree);
    d3treeLayout(root);
    refinement(root, 100);

    svg.call(svgZoom.transform, zoomIdentity).on("dblclick.zoom", null);
    svg.call(svgZoom).on("dblclick.zoom", null);

    svg.select('g').attr("transform", "translate(" + zoomState.x + "," + zoomState.y + ") scale(" + zoomState.k + ")");
    svg.select("g").selectAll(".gnode")
      .data(root.descendants())
      .join(appendNode2, updateNode2, removeNode)
      .selectAll('.element')  // 
      .data(d => d.data.elements, function (d) { return d.value }) // correct version 
      .join(appendElement, updateElement, removeElement)

    svg.select("g").selectAll(".link").data(root.links())
      .join((enter) => appendLink(enter, linkGenerator),
        (update) => updateLink(update, linkGenerator),
        exit => exit.remove())

  }, [update])

  function restart(){
    myTree.reset();
    maxDepth.current = depth(myTree);
    setMergeBtn(true);
    setPointer([myTree]);
    setZoom({ k: 1, x: 0, y: 0 });
    // select(selfRef.current).select('svg').select('g')
    // .attr("transform", "translate(" + 0 + "," + 0 + ") scale(" + 1 + ")")
    setUpdate(update + 1);
    
  }

  function sourceRefine(node) {
    let sourceX = node.source.x;
    let sourceY = node.source.y + 20;
    return [sourceX, sourceY];
  }

  function targetRefine(node) {
    let targetX = node.target.x;
    let targetY = node.target.y;
    return [targetX, targetY];
  }




  function appendNode2(enter) {
    return enter
      .append('g')
      .classed('gnode', true)
      .attr('stroke', (d) => (d.data.solved ? 'green' : 'red'))
      .attr("transform", (d) => `translate(${d.x - d.data.elements.length * 20 / 2},${d.y}) scale(0)`)
      .on("click", (event, data) => { clickHandler(event, data) })
      .transition(nodeTransition)
      .attr("transform", (d) => `translate(${d.x - d.data.elements.length * 20 / 2},${d.y}) scale(1)`)
  }

  function updateNode2(update) {

    return update
      .attr("stroke",(d)=>(d.data.solved ? 'green' : 'red'))
      .attr("transform", (d) => { return `translate(${d.x - d.data.elements.length * 20 / 2},${d.y}) scale(1)`; })
      .on("click", (event, data) => { clickHandler(event, data) })
  }

  /**
   * 
   * @param {function} enter d3 enter function
   */
  function appendElement(enter) {
    let tmp = enter
      .append('g')
      .transition(nodeTransition)
      .delay(300)
      .selection()
      .attr("transform", (d, i) => `translate(${20 * i},${0})`)
      .classed('element', true);

    tmp
      .append('rect')
      .attr('fill', "none")
      .attr('width', 20)
      .attr('height', 20)
      .classed('grect', true)

    tmp.append('text')
      .attr('fontSize', 15)
      .attr('fill', 'black')
      .attr('stroke-width', '0')
      .attr('x', 10)
      .attr('y', 10)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .text(function (d) { return d.value })
      .classed('gtext', true)

    return;

  }

  /**
   * 
   * @param {function} update d3 join update function
   */
  function updateElement(update) {

    let tmp = update;
    let rect = tmp.selectAll('.grect');
    let text = tmp.selectAll('.gtext')
    tmp.transition(nodeTransition)
      .delay(10)
      .attr("transform", (d, i) => { return `translate(${20 * i},${0})` })
    return;
  }

  /**
   * 
   * @param {function} exit d3 exit function
   */
  function removeElement(exit) {

    return exit.transition(nodeTransition).style("opacity", `0`).remove();
  }



  function removeNode(exit) {
    return exit.remove();
  }

  function appendLink(enter, linkGenerator) {

    enter.
      append("path")
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

  function updateLink(update, linkGenerator) {

    return update.attr("d", linkGenerator);
  }

  function zoomHandler(svg) {
    let aa = zoomTransform(svg.node());
    select("g").attr("transform",
      "translate(" + aa.x + "," + aa.y + ")" + " scale(" + aa.k + ")"); 
    setZoom({k:aa.k, x:aa.x, y:aa.y})
  }

  function clickHandler(event, data) {
    if (event.ctrlKey) {
      setSelect([...selected, data]);
    } else {
      setSelect([data]);
    }

  }


  function solve() {
    let next = []
    nodesPointer.forEach(tree => {
      if (!tree.solved) {
        let treeValue = [...tree.elements];
        treeValue = treeValue.sort((a, b) => a.value - b.value);
        tree.elements = treeValue;
        tree.solved = true;
        next.push(tree);
        setUpdate(update + 1);
      }
    })
    setPointer(next);
    maxDepth.current = depth(myTree);

  }

  function split() {
    let next = [];
    nodesPointer.forEach(tree => {
      if (tree.solved) {
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

  /**
   * Insert specified value into the data in elements
   * @param {treeNode} node target TreeNode which receive the value 
   * @param {Integer} value specified value
   */
  function insertValue(tree, value) {
    tree.elements = [...tree.elements, value];
  }

  /**
   * Remove first value of the data in tree
   * @param {treeNode} tree target treeNode which remove first value
   */
  function removeValue(tree) {
    let tmp = [...tree.elements]
    tmp.splice(0, 1);
    tree.elements = tmp;
    if(tree.elements.length == 0){
      tree.parent.removeChild(tree.id);
    }
  }

  /**
   * Get the smallest value from solved arrays one call
   * @param {treeNode[]} treeNodes an array of treeNodes. each treeNode's elements are solved.
   * @returns {[Integer, Object]}an array contains index of treeNode that have smallest value and smallest value.
   * Index 0 is index of treeNode, Index 1 is value. return an empty array if there is no possible value
   */
  function getValue(treeNodes) {
    let value = Number.POSITIVE_INFINITY;
    let index;
    let element;
    

    for(let i = 0; i < treeNodes.length; i++ ){
      if(treeNodes[i].elements.length == 0){
        continue;
      }else if(treeNodes[i].elements[0].value < value){
        value = treeNodes[i].elements[0].value;
        element = treeNodes[i].elements[0];
        index = i;
      }
    }

    if(index == undefined){
      return [];
    }

    return [index, element];
  }

  function mergeOne() {
    let head;
    let value;
    let parent;
    let child;
    console.log(mergeQueue.current)
    if (mergeQueue.current.length == 0) {
      mergeQueue.current = splitByParentID(getNodesAt(myTree, maxDepth.current));
    }
    head = mergeQueue.current.at(0); // get queue head;
    parent = head[0].parent // get parent reference;
    if(!parent.solved){
      parent.elements = [];
      parent.solved = true;
    }

    value = getValue(head); // get value object;
    child = head[value[0]]; // get child reference;

    removeValue(child); // remove value from child 
    insertValue(parent, value[1]) // insert value to parent

    if(head.every(node=>node.elements.length == 0)){
      mergeQueue.current.shift();
    }

    if(mergeQueue.current.length ==0){
      maxDepth.current -= 1;
    }

    setUpdate(update + 1);

    if(maxDepth.current == 0){
      setMergeBtn(true);
    }

  }

  function merge() {
    if (mergeQueue.current.length == 0) {
      mergeQueue.current = splitByParentID(getNodesAt(myTree, maxDepth.current));
    }

    while(mergeQueue.current.length > 0){
      let head = mergeQueue.current.shift();
      while(head.some(node=>node.elements.length != 0)){
        let parent = head[0].parent // get parent reference;
        if(!parent.solved){
          parent.elements = [];
          parent.solved = true;
        }
    
        let value = getValue(head); // get value object;
        let child = head[value[0]]; // get child reference;
    
        removeValue(child); // remove value from child 
        insertValue(parent, value[1]) // insert value to parent
      }
    }
    maxDepth.current -= 1;
    if(maxDepth.current == 0){
      setMergeBtn(true);
    }
    setUpdate(update + 1);
  }

  return (
    <div className='App'>
      <div id='svgContainer' ref={selfRef}>
        <svg className='animationArea' width={500} height={500}>
          <g>

          </g>
        </svg>

      </div>

      <div>
        <div>Current Node:{selected.map(layer1 => layer1.data.elements.map(layer2 => layer2.value) + " / ")}</div>
        <Button onClick={split}>
          Divide
        </Button>
        <Button onClick={solve}>Conquer</Button>
        <Button onClick={merge} disabled={mergeBtnOff}>Merge</Button>
        <Button onClick={mergeOne} disabled={mergeBtnOff}>Next</Button>
        <Button onClick={restart} >Restart</Button>
      </div>

    </div>
  );
}
export default MergeSort;
