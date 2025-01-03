import React from 'react'
import { assets } from '../assets/assets'
import Button from './Button'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row  bg-black text-white'> {/* Hero Left Side */}
    <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
      <div className='text-[#f1f0f0]'>
        <div className='flex items-center gap-2'>
          <p className='w-8 md:w-11 h-[2px] bg-[#ffffff]'></p>
          <p className='font-medium text-sm md:text-base'>SEE AND BE SEEN</p>
        </div>
        <h1 className='text-3xl sm:py-3 lg:text-5xl leading-relaxed' style={{ fontFamily: 'Cutefont, sans-serif' }}>
  RE-INVENT
  <div className='flex items-center gap-2'>
    <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
    <p className='w-8 md:w-11 h-[1px] bg-[#fffefe]'></p>
  </div>
</h1>

        <br/>
        <Button/>
      </div>
       
    </div>

    {/* Hero Right Side */}
    <img className='w-full sm:w-1/2' src={assets.hero_img} alt="" />
  
 
  </div>

  
  )
}

export default Hero
