import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Form1 = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    return (
        <div>
            <h2 className="text-center font-semibold text-2xl mb-4">User Registration</h2>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="first-name" className="block text-sm font-medium">
                        First name
                    </label>
                    <input
                        type="text"
                        id="first-name"
                        placeholder="First name"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="last-name" className="block text-sm font-medium">
                        Last name
                    </label>
                    <input
                        type="text"
                        id="last-name"
                        placeholder="Last name"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
            </div>
            <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium">
                    Email address
                </label>
                <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                <p className="text-sm text-gray-500 mt-1">We'll never share your email.</p>
            </div>
            <div className="mt-4">
                <label htmlFor="password" className="block text-sm font-medium">
                    Password
                </label>
                <div className="relative">
                    <input
                        type={show ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                    <button
                        type="button"
                        onClick={handleClick}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-500"
                    >
                        {show ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Form2 = () => (
    <div>
        <h2 className="text-center font-semibold text-2xl mb-4">User Details</h2>
        <div className="mb-4">
            <label htmlFor="country" className="block text-sm font-medium">
                Country / Region
            </label>
            <select
                id="country"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
                <option>Select option</option>
                <option>Nepal</option>
                <option>India</option>
                
                {/* Add more options */}
            </select>
        </div>
        <div className="mb-4">
            <label htmlFor="street_address" className="block text-sm font-medium">
                Street Address
            </label>
            <input
                type="text"
                id="street_address"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="city" className="block text-sm font-medium">
                    City
                </label>
                <input
                    type="text"
                    id="city"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <div>
                <label htmlFor="state" className="block text-sm font-medium">
                    State / Province
                </label>
                <input
                    type="text"
                    id="state"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
            </div>
        </div>
        <div className="mt-4">
            <label htmlFor="postal_code" className="block text-sm font-medium">
                ZIP / Postal
            </label>
            <input
                type="text"
                id="postal_code"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
        </div>
    </div>
);

const Form3 = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <h2 className="text-center font-semibold text-2xl mb-4">Payment</h2>
            <div className="grid gap-4">
                <div>
                    <label htmlFor="cardno" className="block text-sm font-medium">
                        Card Number
                    </label>
                    <input
                        type="number"
                        id="cardno"
                        placeholder="1234 1234 1234 1234"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium">
                        Exp Date
                    </label>
                    <input
                        type="date"
                        id="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="cvv" className="block text-sm font-medium">
                        CVV
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="cvv"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-500"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">
                        Name on Card
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
            </div>
        </div>
    );
};

export default function Payment() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(33.33);

    return (
        <div className="max-w-3xl mx-auto p-6 border border-gray-200 rounded-lg shadow-lg">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            {step === 1 && <Form1 />}
            {step === 2 && <Form2 />}
            {step === 3 && <Form3 />}
            <div className="flex justify-between mt-6">
                <button
                    disabled={step === 1}
                    onClick={() => {
                        setStep(step - 1);
                        setProgress(progress - 33.33);
                    }}
                    className={`px-4 py-2 rounded-lg ${step === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-500 text-white'
                        }`}
                >
                    Back
                </button>
                {step === 3 ? (
                    <button
                        onClick={() => {
                            Swal.fire(
                                'Order Placed!!',
                                'Your order will be delivered in 5-8 business days!',
                                'success'
                            );
                            navigate('/');
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                        Finish
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setStep(step + 1);
                            setProgress(progress + 33.33);
                        }}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}
