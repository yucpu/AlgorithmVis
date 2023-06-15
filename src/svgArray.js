import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'


const SvgArray = forwardRef((props, ref) => {
  let data = props.data ? props.data : [];
  let arrRef = useRef();
  let elementHeight = props.elementHeight ? props.elementHeight : 20;
  let elementWidth = props.elementWidth ? props.elementHeight : 20;
  let coordinate = props.coordinate ? props.coordinate : { x: 0, y: 0 };
  let solved = sorted();

  function sorted() {
    return data.every((element, index, array) =>
      index == 0 || element.value > array[index - 1].value
    )
  }

 

  let split = (nodes = 2) => {
    let res = [];
    if (nodes > 0 && Number.isInteger(nodes)) {
      let chunkSize = Math.ceil(data.length / nodes);
      for (let i = 0; i < data.length; i += chunkSize) {
        if (i + chunkSize <= data.length) {
          res.push(data.slice(i, i + chunkSize));
        } else {
          res.push(data.slice(i, data.length));
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
    split: (nodes) => {
      return split(nodes);
    },
  }))

  return (
    <svg ref={arrRef} 
      onClick={props.onClick.bind(null, props.index)}
      x={coordinate.x}
      y={coordinate.y}
      width={200}
      height={200}
      style={{border:"1px solid green"}}
       >
      {data.map((d, index) =>
      (
        <g key={"index" + index}>
          <rect x={0+ (index * elementWidth)}
            y={0}
            width={elementWidth}
            height={elementHeight}
            fill='none' stroke={solved ? "green" : "red"}
            strokeWidth={1} />
          <text x={0 + (elementWidth / 2) + (index * elementWidth)}
            y={0 + elementHeight / 2}
            fontSize={16}
            dominantBaseline="middle"
            textAnchor='middle'>
            {d.value}
          </text>
        </g>
      )
      )}
    </svg>
  )
})

export default SvgArray;
