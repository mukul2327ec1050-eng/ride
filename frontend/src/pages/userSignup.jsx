import React, { useState, useContext, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/userContext'

const UserSignup = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)

  const logoRef = useRef(null)

  const navigate = useNavigate()
  const { setUser } = useContext(UserDataContext)

  const submitHandler = async (e) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)

    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email,
      password
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser
      )

      if (response.status === 201 && response.data?.token) {
        const data = response.data
        localStorage.setItem('token', data.token)
        setUser(data.user)
        navigate('/start')
      }

      // reset form
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')

    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message)
      alert(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">

      <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg">

        {/* Logo with vertical line */}
        <div className="flex items-center justify-center mb-14 mt-4">
          <div className="w-[3px] h-7 bg-black mr-3 rounded-full"></div>

          <h1
            ref={logoRef}
            className="text-2xl font-bold tracking-wide "
          >
            AaoChale User
          </h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">
          Create your account
        </h2>

        <form onSubmit={submitHandler} className="space-y-4">

          <input
            required
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg font-semibold transition
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:opacity-90'}`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

        </form>

        <p className="text-center text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>

        <p className="text-[10px] text-center mt-6 text-gray-500 leading-tight">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>

      </div>
    </div>
  )
}

export default UserSignup
