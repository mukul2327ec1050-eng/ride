import React, { useState, useContext, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/userContext'
import axios from 'axios'
import gsap from 'gsap'

const UserLogin = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { setUser } = useContext(UserDataContext)
  const navigate = useNavigate()

  const containerRef = useRef(null)
  const logoRef = useRef(null)
  const logoLineRef = useRef(null)
  const formRef = useRef(null)
  const bottomRef = useRef(null)

  // ---------- ENTRY ANIMATION ----------
  useEffect(() => {

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // vertical bar grow
    tl.fromTo(
      logoLineRef.current,
      { height: 0, opacity: 0 },
      { height: 32, opacity: 1, duration: 0.5 }
    )

    // logo text slide
    .fromTo(
      logoRef.current,
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.5 },
      "-=0.35"
    )

    // form fields
    .fromTo(
      formRef.current ? Array.from(formRef.current.children) : [],
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
      "-=0.2"
    )

    // bottom button
    .fromTo(
      bottomRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4 },
      "-=0.15"
    )

  }, [])

  // ---------- LOGIN ----------
  const submitHandler = async (e) => {
    e.preventDefault()

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/users/login`,
      { email, password }
    )

    if (response.status === 200) {
      const data = response.data
      setUser(data.user)
      localStorage.setItem('token', data.token)
      navigate('/start')
    }

    setEmail('')
    setPassword('')
  }

  // ---------- EXIT TRANSITION ----------
  const handleCaptainRoute = () => {

    gsap.to(containerRef.current, {
      opacity: 0,
      y: -25,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: () => navigate('/captain-login')
    })
  }

  return (
    <div ref={containerRef} className='p-7 h-screen flex flex-col justify-between bg-background'>

      <div>

        {/* LOGO WITH VERTICAL BAR */}
        <div className="flex items-center gap-3 mb-14 mt-4 pb-20">

          <div
            ref={logoLineRef}
            className="w-[3px] bg-white rounded-full"
            style={{ height: "32px" }}
          ></div>

          <h1 ref={logoRef} className="text-2xl font-semibold text-foreground">
            AaoChale User
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

          <button className='uber-btn-primary mb-3'>Login</button>

          <p className='text-center text-muted-foreground'>
            New here?{' '}
            <Link
              to='/signup'
              className='text-foreground underline underline-offset-4 hover:text-accent transition-colors'
            >
              Create new Account
            </Link>
          </p>
        </form>
      </div>

      <div ref={bottomRef}>
        <button
          onClick={handleCaptainRoute}
          className='uber-btn-accent mb-3 w-full'
        >
          Sign in as Captain
        </button>
      </div>

    </div>
  )
}

export default UserLogin
