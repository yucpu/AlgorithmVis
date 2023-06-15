import React from 'react'

export default function Circle(props) {

  return (
    <svg>
        <circle
        cx={props.cx}
        cy={props.cy}
        r={props.r}
        />
    </svg>
  )
}
