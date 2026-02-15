import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "./pages/home.jsx"
import UserLogin from "./pages/userLogin.jsx"
import UserSignup from "./pages/userSignup.jsx"
import CaptainLogin from "./pages/captainLogin.jsx"
import CaptainSignup from "./pages/captainSignup.jsx"
import Start from "./pages/start.jsx"
import UserProtectWrapper from './pages/userProtectWrapper.jsx'
import UserLogout from './pages/UserLogout.jsx'
import CaptainHome from './pages/CaptainHome.jsx'
import Riding from './pages/Riding.jsx'
import CaptainRiding from './pages/CaptainRiding.jsx'


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/riding' element={<Riding />} />
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain-login' element={<CaptainLogin />} />
        <Route path='/captain-riding' element={<CaptainRiding />} />
        <Route path='/captain-signup' element={<CaptainSignup />} />
        <Route path='/start' element={<UserProtectWrapper><Start /></UserProtectWrapper>} />
        <Route path='/users/logout' element={<UserProtectWrapper><UserLogout /></UserProtectWrapper>} />
        <Route path='/captain-home' element={<UserProtectWrapper><CaptainHome /></UserProtectWrapper>} />
      </Routes> 
    </div>
  )
}

export default App
