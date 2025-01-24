import React from 'react';
import { assets } from '../assets/assets';

const Frame = () => {
  return (
    <div className="w-full h-full">
      <img className="w-full h-full object-cover" src={assets.frame} alt="Frame" />
    </div>
  );
};

export default Frame;