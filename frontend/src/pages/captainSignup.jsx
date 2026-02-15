import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaptainDataContext } from '../context/captainContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useRef } from 'react'

const CaptainSignup = () => {

  const navigate = useNavigate();
  const { captain, setCaptain } = useContext(CaptainDataContext);

  const logoRef = useRef(null)

  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')

  const [ vehicleColor, setVehicleColor ] = useState('')
  const [ vehiclePlate, setVehiclePlate ] = useState('')
  const [ vehicleCapacity, setVehicleCapacity ] = useState('')
  const [ vehicleType, setVehicleType ] = useState('')

  const submitHandler = async (e) => {
    e.preventDefault()
    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType
      }
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData)

    if (response.status === 201) {
      const data = response.data
      setCaptain(data.captain)
      localStorage.setItem('token', data.token)
      navigate('/captain-home')
    }

    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setVehicleColor('')
    setVehiclePlate('')
    setVehicleCapacity('')
    setVehicleType('')
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">

      <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg overflow-y-auto max-h-[95vh]">

        {/* Logo */}
        <div className="flex items-center justify-center mb-10 mt-2">
          <div className="w-[3px] h-7 bg-black mr-3 rounded-full"></div>
          <h1 ref={logoRef} className="text-2xl font-bold tracking-wide ">
            AaoChale 
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-center mb-6">
          Captain Registration
        </h2>

        <form onSubmit={(e)=>submitHandler(e)} className="space-y-4">

          <input
            required
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e)=>setFirstName(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e)=>setLastName(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Vehicle Section */}
          <h3 className="text-sm font-semibold pt-2">Vehicle Details</h3>

          <input
            required
            type="text"
            placeholder="Vehicle Color"
            value={vehicleColor}
            onChange={(e)=>setVehicleColor(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="text"
            placeholder="Vehicle Plate"
            value={vehiclePlate}
            onChange={(e)=>setVehiclePlate(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            required
            type="number"
            placeholder="Vehicle Capacity"
            value={vehicleCapacity}
            onChange={(e)=>setVehicleCapacity(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />

          <select
            required
            value={vehicleType}
            onChange={(e)=>setVehicleType(e.target.value)}
            className="w-full bg-gray-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="" disabled>Select Vehicle Type</option>
            <option value="car">Car</option>
            <option value="auto">Auto</option>
            <option value="moto">Moto</option>
          </select>

          <button className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:opacity-90 transition">
            Create Captain Account
          </button>

        </form>

        <p className="text-center text-sm mt-5">
          Already have an account?{' '}
          <Link to="/captain-login" className="text-blue-600 font-medium">
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

export default CaptainSignup
