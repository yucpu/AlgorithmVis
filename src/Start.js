import React from 'react'
import ClosetPoint from './algorithm/ClosetPoint';
import MergeSort from './algorithm/MergeSort';
import '../src/App.css';
import { Avatar, Link, Menu, MenuItem } from '@mui/material';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './home/HomePage';
import Visualization from './algVis/Visualization';
import About from './about/About';



const github = require('../src/assets/github-mark.png')

export default function Start() {
  const navigate = useNavigate();

  return (
    <div className='StartPage'>
      <header className='App-header'>
        <div>
          <span>Alg Visualization</span>
          <span> DC</span>
        </div>
        <div className='App-menu'>
          <span onClick={() => { navigate("/") }}>
            Home
          </span>
          <span onClick={() => { navigate("/visualization") }}>
            Visualization
          </span>
          <span onClick={() => { navigate("/about") }}>
            About
          </span>
        </div>
        <Avatar style={{ cursor: "pointer" }} className='github' alt="Github" src={github}>

        </Avatar>
      </header>
      <main className='App-content'>
        <Routes>
          <Route exact path='/' element={<HomePage />} ></Route>
          <Route path='/visualization' element={<Visualization />}></Route>
          <Route path='/mergeSort' element={<MergeSort />}></Route>
          <Route path='/ClosetPairPoint' element={<ClosetPoint />}></Route>
          <Route path='/about' element={<About />}></Route>
        </Routes>

      </main>
      <footer className='App-footer'>
        <div className='splitLine'></div>
        Divide and Conquer Algorithm Visualization @ Yuchen Pu
      </footer>
    </div>
  )
}
