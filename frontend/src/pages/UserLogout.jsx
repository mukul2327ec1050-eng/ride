import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const UserLogout = () => {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (err) {
        // even if the request fails, we still log out locally
        console.error('Logout API failed, but clearing token anyway')
      } finally {
        localStorage.removeItem('token')
        navigate('/login')
      }
    }

    logoutUser()
  }, [navigate, token])

  return <div>Logging out...</div>
}

export default UserLogout
