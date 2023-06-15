import { useEffect, useRef, useState } from 'react';
import {select, tree, linkVertical, hierarchy, zoom, zoomTransform, transition,easeLinear, selection} from 'd3';
import './App.css';
import AArray from './AArray';
import SvgArray from './svgArray';
import ATree from './ATree';
import { treeNode, GetUniqueID, splitNArray, depth, treeLayout,refinement} from './util';


const data = [{key:"key3",value:3},{key:"key2",value:2},{key:"key9",value:1},{key:"key4",value:4},{key:"key19",value:19}];
const myTree = new treeNode(data, GetUniqueID());

function App() {
  const selfRef = useRef(null);
  const arrRefs = useRef([]);
  const nodeTransition = transition().duration(300).ease(easeLinear);
  // let [data,setData] = useState([{key:"key3",value:3},{key:"key2",value:2},{key:"key9",value:1},{key:"key4",value:4},{key:"key19",value:19}])
  // const myTree = new treeNode(data, GetUniqueID());
  let [nodes, setNodes] = useState(1); 
  let [selected, setSelect] = useState([]); 
  let [clickAmount, setClick] = useState(0);
  let [zoomState, setZoom] = useState({k:1, x:0, y:0});
  
  
     

  // },[])
  useEffect(() => {
    const app = select(selfRef.current);
    const svg = app.select("svg");
    const svgZoom = zoom().on("zoom",()=>{zoomHandler(svg)});
    const d3treeLayout = tree().size([500,200]);
    const linkGenerator = linkVertical().x(node=>node.x).y(node=>node.y);
    // treeLayout(myTree,500,200);
    const root = hierarchy(myTree);
    
    d3treeLayout(root);
    refinement(root, 100);
    // svg.selectAll('g').remove();
    svg.call(svgZoom).on("dblclick.zoom",null);

    svg.select('g').attr("transform", "translate(" + zoomState.x + "," + zoomState.y + ") scale("+zoomState.k+")");

    svg.select("g").selectAll(".node")
    .data(root.descendants())
    .join(appendNode, updateNode, removeNode)
    .classed("node",true)


    // svg.select('g').selectAll(".link").remove();
    svg.select("g").selectAll(".link").data(root.links())
    .join((enter)=>appendLink(enter, linkGenerator),
      (update)=>updateLink(update, linkGenerator),
      exit=>exit)

    
  },[nodes,selected])


  /**
   * 
   * @param {d3 enter selection} enter 
   * @returns 
   */
  function appendNode(enter){
    console.log(enter);
    return enter
    .append('g')
    .classed('gnode',true)
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d=>d.y)
    .attr("r",(d)=>{console.log(d); return 10})
    .attr("fill","white")
    .style("display",function(d){if(d.display){return d.display}})
    .attr("stroke","green")
    .on("click",(event,data)=>{clickHandler(event,data)})
    
    .transition(nodeTransition)
    
  }

  function updateNode(update){
    return update.attr("cx", d=>d.x).attr("cy", d=>d.y);
  }

  function removeNode(exit){
    return exit;
  }

  function appendLink(enter, linkGenerator){
    return enter.append("path").classed("link",true).attr("fill","none").attr("stroke","black").attr("d", linkGenerator);
 
  }

  function updateLink(update, linkGenerator){
    
    return update.attr("d", linkGenerator);
  }

  function zoomHandler(svg){
    let aa = zoomTransform(svg.node());
    select("g").attr("transform",
    "translate(" + aa.x+","+aa.y +")"+ " scale(" + aa.k + ")");
    setZoom({k:aa.k, x:aa.x, y:aa.y});
  }

  function clickHandler(event,data){
    if(event.ctrlKey){
      console.log("Multi-Select Event");
      console.log(selected);
      setSelect([...selected, data]);
    }else{
      console.log(data.data.node);
      setSelect([data]);
    }
    
  }

  function clickExp(event){
    setClick(clickAmount+1);
  }


  function solve(){
    selected.forEach(item=>{
      let targetNode = item.data;
      // finding node in the tree
      let targetTree = myTree.find(targetNode);
      let nodeData = targetNode.node;
      // sort treeData by value;
      nodeData = nodeData.sort((a,b)=> a.value - b.value);
      //create new child
      let childTree = new treeNode(nodeData, GetUniqueID());
      targetTree.setChild(childTree);
      setNodes(nodes+1);
    })
    setSelect([]);
  }

  function merge(){
    let childTree = new treeNode([], GetUniqueID());
    selected.forEach(item=>{
      let targetNode = item.data;
      let targetTree = myTree.find(targetNode);
      let nodeData = targetNode.node;
      
      childTree.node = [...childTree.node, ...nodeData];
      targetTree.setChild(childTree);
    
    })
    setNodes(nodes+1);
  }

  function split(){
    console.log(selected);
    selected.forEach(item=>{
     
      let targetNode = item.data;
      // finding node in the tree
      let targetTree = myTree.find(targetNode);
      console.log(targetTree);
      let nodeData = targetNode.node;
      // sort treeData by value;
      let chunks = splitNArray(nodeData,2);

      for(let i = 0; i< chunks.length; i++){
        let childTree = new treeNode(chunks[i],GetUniqueID());
        targetTree.setChild(childTree);
      }
      setNodes(nodes+chunks.length);
    })
    setSelect([]);
  }

  return (
    // <div className="App" ref={selfRef}>
    //   {nodes.map((item, index)=>(
    //     <AArray key={"AArray"+index} 
    //       data={item} 
    //       ref={(ref)=>{arrRefs.current[index]= ref}} 
    //       index={index}
    //       onClick={(res)=>{setSelect(res)}} />
    //   ))}
      

    //   {/* <AArray ref={arrRefs} data={data} onClick={(res)=>{setSelect(res)}}/> */}
    //   <button onClick={()=>{
    //     setNodes([...nodes, ...arrRefs.current[selected].split(2)])
    //   }}>Split</button>
    // </div>
    
    <div className='App' ref={selfRef}>
      <svg className='animationArea' ref={selfRef} width={500} height={500} style={{border:"1px solid green"}}>
        <g>

        </g>
      </svg>
      <button onClick={split}>
        Split
      </button>
      <button onClick={solve}>Solve</button>
      <button onClick={merge}>Merge</button>
    </div>
    
    // <div className='App'>
    //   <ATree ref={arrRefs.current[selected]} width={400} height={400}/>
    // </div>
  );
}

export default App;
