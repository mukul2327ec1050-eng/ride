import React from 'react'

const VehiclePanel = (props) => {
  return (
    <div>
       <div >
                <div onClick={() => {
                    props.setVehiclePanelOpen(false)
                }} className='absolute w-[93%] right-3 top-0 text-center  text-3xl '  >
                    <i className="ri-arrow-down-wide-line text-gray-400"></i>

                </div>
                <h3 className='text-2xl font-bold mb-5 mt-5'>Choose a Vehicle</h3>
                <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('car')
                    props.setVehiclePanelOpen(false)
                }} className='flex  active:border-black border-2 rounded-xl w-full p-3 items-center '>
                    <img className='h-12 mr-2' src='https://tb-static.uber.com/prod/udam-assets/42eb85c3-e2dc-4e95-a70d-22ee4f08015f.png'/>
                    <div className='w-1/2'>
                        <h4 className='font-medium text-base'>UberGo <span><i className='ri-user-3-fill'></i>4</span></h4>
                        <h5 className='font-medium text-sm' >2 min away</h5>
                        <p className='font-normal text-xs text-gray-600'>Affordable, compact ride</p>
                    </div>
                    <h2 className='text-lg font-semibold '>₹ {props.fare.car}</h2>
                </div>
            </div>
            <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('auto')
                    props.setVehiclePanelOpen(false)
                }}  className='mt-3'>
                <div className='flex  active:border-black border-2 rounded-xl w-full p-3 items-center '>
                    <img className='h-12 mr-4' src='https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8yYzdmYTE5NC1jOTU0LTQ5YjItOWM2ZC1hM2I4NjAxMzcwZjUucG5n'/>
                    <div className='w-1/2'>
                        <h4 className='font-medium text-base'>Moto <span><i className='ri-user-3-fill'></i>1</span></h4>
                        <h5 className='font-medium text-sm' >3 min away</h5>
                        <p className='font-normal text-xs text-gray-600'>Affordable, Motorcycle ride</p>
                    </div>
                    <h2 className='text-lg font-semibold'>₹ {props.fare.auto}</h2>
                </div>
            </div>
            <div onClick={() => {
                    props.setConfirmRidePanel(true)
                    props.selectVehicle('moto')
                    props.setVehiclePanelOpen(false)
                }}  className='mt-3'>
                <div className='flex  active:border-black border-2 rounded-xl w-full p-3 items-center '>
                    <img className='h-12 mr-4' src='https://clipart-library.com/2023/Uber_Auto_312x208_pixels_Mobile.png'/>
                    <div className='w-1/2'>
                        <h4 className='font-medium text-base'>Auto <span><i className='ri-user-3-fill'></i>3</span></h4>
                        <h5 className='font-medium text-sm' >4 min away</h5>
                        <p className='font-normal text-xs text-gray-600'>Affordable, AutoRikshaw ride</p>
                    </div>
                    <h2 className='text-lg font-semibold'>₹ {props.fare.auto}</h2>
                </div>
            </div>
    </div>
  )
}

export default VehiclePanel
