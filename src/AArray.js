import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as d3 from 'd3';

const AArray = forwardRef((props, ref) => {
    let [data, setData] = useState(props.data? props.data:[]);
    let arrRef = useRef();
    let t = d3.transition()
    .duration(150)
    .ease(d3.easeLinear);

    useEffect(() => {
        
        let solved = sorted(data);
        console.log(solved);
        const selection = d3.select(arrRef.current).selectAll("div").data(data);
        selection.join(enter=> (
             enter.append('div')
             .text(d => (d.value))
             .attr("class", solved ? "solved-arr-element":"problem-arr-element")
             .style("transform","scale(0)")
             .transition(t)
             .style("transform","scale(1)").selection()

        ),
        update=>update,
        exit=>{
            exit.transition(t).style("transform","scale(0)").remove();
        })
        // selection.join(enter=> {
        //     enter.append('div')
        //     .text(d => (d.value))
        //     .attr("class", "arr-element")
        //     .style("transform","scale(0)")
        //     .call(enter=> enter.transition(t).style("transform","scale(1)"));

        //    },)
        

    }, [data])

    function sorted(){
        return data.every((element, index,array)=>
            index == 0 || element.value > array[index-1].value
        )
    }

    let add = (value) => {
        setData([...data, { key: "key" + value, value: value }]);
    }

    let remove = () => {
        let tmp = [...data]
        tmp.splice(tmp.length - 1, 1)
        setData(tmp);

    }

    let split=(nodes=2)=>{
        let res = [];
        if(nodes > 0 && Number.isInteger(nodes)){
            let chunkSize = Math.ceil(data.length/nodes);
            for(let i = 0; i < data.length; i+= chunkSize){
                if(i+chunkSize <= data.length){
                    res.push(data.slice(i, i+chunkSize));
                }else{
                    res.push(data.slice(i,data.length));
                }
                
            } 
        }
        return res;
    }

    useImperativeHandle(ref, () => ({
        funcOne: () => {
            console.log("this")
        },
        initial: () => {
            console.log("initial")
        },
        add: () => {
            let random = Math.floor(Math.random()*(100))
            add(random);
        },
        remove: () => {
            remove();
        },
        split: (nodes)=>{
            return split(nodes);
        },
    }))


    return (
        <div className='chart' 
            ref={arrRef} 
            style={{ display: 'flex', flexDirection: "row", justifyContent: "center" }}
            onClick={props.onClick.bind(null,props.index)}
        >
        </div>
    )

}
)

export default AArray