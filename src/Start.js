import React from 'react'

import ClosetPoint from './ClosetPoint';
import MergeSort from './MergeSort';
import '../src/App.css';
import { Avatar, Link, Menu, MenuItem } from '@mui/material';

export default function Start() {
  return (
    <div className='StartPage'>
        <header className='App-header'>
          <div>
            <span>Alg Visualization</span>
            <span> DC</span>
          </div>
          <div className='App-menu'>
              <span onClick={()=>{console.log("Home")}}>
                Home
              </span>
              <span onClick={()=>{console.log("Visualization")}}>
                Visualization
              </span>
              <span onClick={()=>{console.log("About")}}>
                About
              </span>
          </div>
          <Avatar className='github' alt="Github" src="public/github-mark.svg">

          </Avatar>
        </header>
        <content>
          
        </content>
        <footer className='App-footer'>
          Divide and Conquer Algorithm Visualization @ Yuchen Pu
        </footer>
    </div>
  )
}
