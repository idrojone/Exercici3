import './App.css'
import Header from './components/header.jsx'
import Home from './pages/home.jsx'
import LogIn from './pages/logIn.jsx'
import { Routes, Route } from 'react-router'
import Register from './pages/register.jsx'
import Chat from './pages/chat.jsx'

function App() {


  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />}  className="bg-green-100" />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  )
}

export default App