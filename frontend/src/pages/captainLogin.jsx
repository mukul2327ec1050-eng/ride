import React, { useState, useContext, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import gsap from 'gsap'
import { CaptainDataContext } from '../context/captainContext'
import io from 'socket.io-client'


const socket = io(import.meta.env.VITE_BASE_URL)


const CaptainLogin = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captainData, setCaptainData] = useState('')

  const navigate = useNavigate()
  const { captain, setCaptain } = useContext(CaptainDataContext)

  const containerRef = useRef(null)
  const logoRef = useRef(null)
  const logoLineRef = useRef(null)
  const formRef = useRef(null)
  const bottomRef = useRef(null)

  // ---------- ENTRY TRANSITION ----------
  useEffect(() => {

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, filter: "blur(10px)", y: 20 },
      { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.5, ease: "power2.out" }
    )

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // vertical line grow
    tl.fromTo(logoLineRef.current,
      { height: 0, opacity: 0 },
      { height: 32, opacity: 1, duration: 0.5 }
    )

    // logo text
    .fromTo(logoRef.current,
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.5 },
      "-=0.35"
    )

    // form fields
    .fromTo(
      formRef.current?.children ? Array.from(formRef.current.children) : [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
      '-=0.2'
    )

    // bottom button
    .fromTo(bottomRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4 },
      '-=0.1'
    )

  }, [])

  // ---------- LOGIN ----------
  const submitHandler = async (e) => {
    e.preventDefault()

    const captain = { email, password }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captain)

    if (response.status === 200) {

       const data = response.data

       setCaptain(data.captain)
       localStorage.setItem('token', data.token)
       localStorage.setItem('captain', JSON.stringify(data.captain))

  // 🔴 VERY IMPORTANT
  socket.emit("join", {
    userId: data.captain._id,
    userType: "captain"
  });

  navigate('/captain-home')
}


    setEmail('')
    setPassword('')
  }

  // ---------- EXIT TRANSITION ----------
  const handleUserRoute = () => {
    const tl = gsap.timeline({
      onComplete: () => navigate('/login')
    })

    tl.to(containerRef.current, {
      opacity: 0,
      filter: "blur(10px)",
      y: -20,
      duration: 0.35,
      ease: "power2.inOut"
    })
  }

  return (
    <div ref={containerRef} className='p-7 h-screen flex flex-col justify-between bg-background'>

      <div>

        {/* LOGO WITH VERTICAL LINE */}
        <div className="flex items-center gap-3 mb-14 mt-4 pb-20">

          <div
            ref={logoLineRef}
            className="w-[3px] bg-white rounded-full"
            style={{ height: "32px" }}
          ></div>

          <h1 ref={logoRef} className="text-2xl font-semibold text-foreground">
            AaoChale Captain
          </h1>

        </div>

        <form ref={formRef} onSubmit={submitHandler}>

          <h3 className='text-lg font-medium mb-2 text-foreground'>What's your email</h3>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='uber-input mb-7'
            type="email"
            placeholder='email@example.com'
          />

          <h3 className='text-lg font-medium mb-2 text-foreground'>Enter Password</h3>
          <input
            className='uber-input mb-7'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder='password'
          />

          {/* CAPTAIN BUTTON COLOR KEPT */}
          <button className='bg-[#111] text-white font-semibold mb-3 rounded-xl h-[55px] w-full text-lg'>
            Login
          </button>

          <p className='text-center text-muted-foreground'>
            Join fleet?{' '}
            <Link
              to='/captain-signup'
              className='text-foreground underline underline-offset-4 hover:text-accent transition-colors'
            >
              Register as Captain
            </Link>
          </p>

        </form>
      </div>

      <div ref={bottomRef}>
        <button
          onClick={handleUserRoute}
          className='bg-red-400 text-white flex items-center justify-center font-semibold rounded-xl h-[55px] w-full text-lg'
        >
          Sign in as User
        </button>
      </div>

    </div>
  )
}

export default CaptainLogin
