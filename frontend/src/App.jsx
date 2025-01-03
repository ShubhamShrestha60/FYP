// import React from 'react'
// import {Routes,Route} from 'react-router-dom'
// import Navbar from './components/Navbar';
// import Home from './pages/Home'
// import Collection from './pages/Collection'
// import About from './pages/About'
// import Cart from './pages/Cart'
// import Contact from './pages/Contact'
// import Product from './pages/Product'
// import Login from './pages/Login'
// import PlaceOrder from './pages/PlaceOrder'
// import Orders from './pages/Orders'
// import Sunglasses from './pages/Sunglasses'
// import Eyeglasses from './pages/Eyeglasses'
// import ContactLens from './pages/ContactLens'
// import TryOn from './pages/TryOn'
// import Prescription from './pages/Prescription'


// const App = () => {
//   return (
  
//     <div className="bg-black flex-1">
//       <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] w-full'>
//       <Navbar />
//       <Routes>
//         <Route path='/' element={<Home/>} />
//         <Route path='/collection' element={<Collection/>} />
//         <Route path='/about' element={<About/>} />
//         <Route path='/contact' element={<Contact/>} />
//         <Route path='/product/:productId' element={<Product/>} />
//         <Route path='/cart' element={<Cart/>} />
//         <Route path='/login' element={<Login/>} />
//         <Route path='/place-order' element={<PlaceOrder/>} />
//         <Route path='/orders' element={<Orders/>} />

//         <Route path='/sunglasses' element={<Sunglasses/>} />
//         <Route path='/eyeglasses' element={<Eyeglasses/>} />
//         <Route path='/prescription' element={<Prescription/>} />
//         <Route path='/contactlens' element={<ContactLens/>} />
//         <Route path='/tryon' element={<TryOn/>} />
//       </Routes>
//      </div>
//       <div className="bg-red-600 flex-1">
//         {/* You can add content here for the lower half if needed */}
//         <div className='flex items-center justify-center h-full text-white'>
//           <h1 className="text-4xl">Lower Half (Red)</h1>
//         </div>
//       </div>
//     </div>

//   )
// }

// export default App


// //px denotes padding
//   // This is a Tailwind CSS utility-based className. 
// // Instead of traditional CSS class definitions, Tailwind provides predefined utility classes:
// // - `px-4`: Adds horizontal padding of 1rem (16px) by default.
// // - `sm:px-[5vw]`: Changes horizontal padding to 5% of the viewport width on small screens (≥640px).
// // - `md:px-[7vw]`: Sets padding to 7% of the viewport width on medium screens (≥768px).
// // - `lg:px-[9vw]`: Sets padding to 9% of the viewport width on large screens (≥1024px).
// // This allows for responsive styling directly in the `className`, eliminating the need for separate CSS files.




import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Collection from './pages/Collection';
import About from './pages/About';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Sunglasses from './pages/Sunglasses';
import Eyeglasses from './pages/Eyeglasses';
import ContactLens from './pages/ContactLens';
import TryOn from './pages/TryOn';
import Prescription from './pages/Prescription';
import Signup from './pages/Signup';
import Frame from './components/Frame1';

const App = () => {
  return (
    <div className="flex-1" style={{ backgroundColor: '#940303' }}>
    <div className="flex flex-col h-screen">
      {/* Upper Half: Black Background with Navbar and Routes */}
      <div className="bg-black flex-none h-1.5/3 relative rounded-br-[50px]"> {/* Rounded bottom corners */}
        <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] w-full'>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/collection' element={<Collection />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/product/:productId' element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/place-order' element={<PlaceOrder />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/sunglasses' element={<Sunglasses />} />
            <Route path='/eyeglasses' element={<Eyeglasses />} />
            <Route path='/prescription' element={<Prescription />} />
            <Route path='/contactlens' element={<ContactLens />} />
            <Route path='/tryon' element={<TryOn />} />
            <Route path='/signup' element={<Signup/>} />
            <Route path='/frame' element={<Frame/>} />
          </Routes>
        </div>
      </div>

      <div className="bg-red-700 flex-1">
        <div className='flex items-center justify-center h-full text-white'>
         <Frame/>
        </div>
      </div>
      
    </div>
</div>

  );
};

export default App;