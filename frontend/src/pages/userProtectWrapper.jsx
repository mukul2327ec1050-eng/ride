import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserProtectWrapper = ({
    children
}) => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    const { user, setUser } = useContext(UserDataContext)
    const [ isLoading, setIsLoading ] = useState(true)

    useEffect(() => {
        if (!token) {
            navigate('/login')
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            if (response.status === 200) {
                setUser(response.data)
                setIsLoading(false)
            }
        })
            .catch(err => {
                console.log(err)
                localStorage.removeItem('token')
                navigate('/login')
            })
    }, [ token ])

    // loading animation 
    if (isLoading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-6">

                {/* Spinner */}
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                </div>

                {/* Text */}
                <p className="text-gray-600 font-medium tracking-wide">
                    Checking session...
                </p>

            </div>
        </div>
    )
}


    return (
        <>
            {children}
        </>
    )
}

export default UserProtectWrapper