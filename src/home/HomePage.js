import React, { useEffect, useRef, useState } from 'react'
import { marked } from 'marked';
import '../home/Home.css';

const doc = require('../home/introduction.md');


export default function HomePage() {
  let [intro, setIntro] = useState("## Loading");
  let myRef = useRef();

  useEffect(()=>{
    fetch(doc).then(res=>res.text()).then(txt=>setIntro(marked(txt)));
  },[])

  useEffect(()=>{
    
    myRef.current.innerHTML = intro;
  }
  ,[intro])
  
  return (
    <div className='HomePage'>
      <div className='projectTitle'>
        <span style={{ fontWeight: "bold", fontFamily: "revert" }}>
          The Project
        </span>
        <span style={{fontWeight:"bold", fontSize:'40px', wordSpacing:"20px", fontFamily:"fangsong"}}>
          DC Algorithm Visualzaition
        </span>
        <span style={{fontSize:"14px", fontWeight:"500"}}>
          The divide and conquer algorithm visualization tool with High-Level Control
        </span>
      </div>
      <div className='introduction' ref={myRef}>
        
          
        
      </div>
    </div>
  )
}
