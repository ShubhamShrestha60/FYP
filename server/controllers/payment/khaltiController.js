const axios = require('axios');
const Order = require('../../models/Order');
const Product = require('../../models/Product');

const initiatePayment = async (req, res) => {
    try {
        console.log('Initiating Khalti payment with data:', {
            ...req.body,
            amount: req.body.amount,
            purchase_order_id: req.body.purchase_order_id
        });

        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            req.body,
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Khalti initiation response:', response.data);
        
        if (response.data && response.data.payment_url) {
            res.json(response.data);
        } else {
            console.error('Invalid response from Khalti:', response.data);
            res.status(400).json({ error: 'Payment URL not received from Khalti', details: response.data });
        }
    } catch (error) {
        console.error('Khalti payment initiation error:', error.response?.data || error.message);
        res.status(400).json({ 
            error: 'Payment initiation failed', 
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { pidx, orderId } = req.body;

        if (!pidx || !orderId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required parameters: pidx and orderId are required'
            });
        }

        // Get order details
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Verify payment with Khalti
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Khalti verification response:', response.data);

        if (response.data.status === 'Completed') {
            // Check product stock before updating
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (!product) {
                    return res.status(404).json({
                        status: 'error',
                        message: `Product not found: ${item.product}`
                    });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        status: 'error',
                        message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                    });
                }
            }

            // Update order status
            order.paymentStatus = 'paid';
            order.paymentDetails = {
                provider: 'khalti',
                transactionId: pidx,
                amount: response.data.amount,
                status: 'completed',
                verifiedAt: new Date()
            };
            await order.save();

            // Update product stock
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    await product.save();
                }
            }

            return res.json({
                status: 'success',
                message: 'Payment verified successfully',
                data: {
                    orderId: order._id,
                    paymentStatus: 'completed',
                    amount: response.data.amount
                }
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Payment verification failed',
                details: response.data
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Payment verification failed',
            details: error.response?.data || error.message
        });
    }
};

module.exports = { initiatePayment, verifyPayment };