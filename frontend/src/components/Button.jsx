import React from 'react';
import { NavLink } from 'react-router-dom';

const Button = () => {
  return (
    <NavLink to= '/collection'>
    <button className="px-6 py-3 rounded-[10px] bg-gradient-to-r from-red-600 to-red-400 text-white text-stencil uppercase font-bold hover:from-red-500 hover:to-red-300 transition duration-300">
      Shop Now
    </button>
    </NavLink>
  );
};

export default Button;
