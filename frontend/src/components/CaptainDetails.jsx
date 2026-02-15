import React, { useContext } from 'react'
import { CaptainDataContext } from '../context/captainContext'

const CaptainDetails = () => {

    const { captain } = useContext(CaptainDataContext)

    return (
        <div className='bg-white rounded-2xl shadow-lg p-5 w-full'>

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <img
                        className='h-12 w-12 rounded-full object-cover'
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s"
                        alt=""
                    />

                    <h4 className='text-lg font-medium capitalize'>
                        {captain?.fullname?.firstname}
                    </h4>
                </div>

                <div>
                    <h4 className='text-xl font-semibold'>₹295.20</h4>
                    <p className='text-sm text-gray-600'>Earned</p>
                </div>
            </div>

            <div className='flex p-3 mt-6 bg-gray-100 rounded-xl justify-center gap-5 items-start'>
                <div className='text-center'>
                    <i className="text-3xl mb-2 ri-timer-2-line"></i>
                    <h5 className='text-lg font-medium'>10.2</h5>
                    <p className='text-sm text-gray-600'>Hours Online</p>
                </div>

                <div className='text-center'>
                    <i className="text-3xl mb-2 ri-speed-up-line"></i>
                    <h5 className='text-lg font-medium'>25</h5>
                    <p className='text-sm text-gray-600'>Trips</p>
                </div>

                <div className='text-center'>
                    <i className="text-3xl mb-2 ri-star-line"></i>
                    <h5 className='text-lg font-medium'>4.9</h5>
                    <p className='text-sm text-gray-600'>Rating</p>
                </div>
            </div>

        </div>
    )
}

export default CaptainDetails
