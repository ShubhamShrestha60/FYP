import axios from 'axios';
import { API_BASE_URL } from '../config/config';

export const khaltiService = {
    initiatePayment: async (paymentData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/payment/khalti/initiate`, paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    verifyPayment: async (verificationData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/payment/khalti/verify`, verificationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};