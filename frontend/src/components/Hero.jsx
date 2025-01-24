import React from 'react'
import { assets } from '../assets/assets'
import Button from './Button'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row bg-black text-white min-h-[80vh]'>
      <div className='w-full sm:w-1/2 flex items-center justify-center p-10'>
        <div className='text-[#f1f0f0] max-w-lg'>
          <div className='flex items-center gap-2 mb-4'>
            <p className='w-12 h-[2px] bg-[#ffffff]'></p>
            <p className='font-medium text-lg'>LUXURY EYEWEAR</p>
          </div>
          <h1 className='text-5xl sm:text-6xl font-bold mb-6'>
            DISCOVER YOUR
            <br />
            PERFECT STYLE
          </h1>
          <p className='text-gray-300 mb-8'>
            Explore our curated collection of designer frames and premium eyewear.
            Find the perfect match for your unique style.
          </p>
          <Button />
        </div>
      </div>
      <div className='w-full sm:w-1/2 relative'>
        <img 
          className='w-full h-full object-cover' 
          src={assets.hero_img} 
          alt="Luxury Eyewear" 
        />
        <div className='absolute bottom-8 right-8 bg-white/10 backdrop-blur-md p-4 rounded-lg'>
          <p className='text-2xl font-bold'>20% OFF</p>
          <p className='text-sm'>On First Purchase</p>
        </div>
      </div>
    </div>
  )
}

export default Hero
