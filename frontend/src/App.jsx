import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/header.jsx'
import Home from './components/home.jsx'
import LogIn from './components/logIn.jsx'
import { Routes, Route } from 'react-router'

function App() {


  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />}  className="bg-green-100" />
      </Routes>
    </>
  )
}

export default App