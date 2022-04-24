const express = require('express');
const router = express.Router();

const CartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/', async (req, res) => {
    const cart = new CartServices(req.session.user.id);

    // get all the items from the cart
    let items = await cart.getCart();

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let item of items) {
        const lineItem = {
            'name': item.related('cartposter').get('title'),
            'amount': item.related('cartposter').get('cost_cents'),
            'quantity': item.get('quantity'),
            'currency': 'SGD'
        }
        // if (item.related('cartposter').get('image_url')) {
        //     lineItem['images'] = [item.related('cartposter').get('image_url')]
        // }
        lineItems.push(lineItem);
        // save the quantity data along with the product id
        meta.push({
            'poster_id' : item.get('poster_id'),
            'quantity': item.get('quantity')
        })
    }

    // step 2 - create stripe payment
    let metaData = JSON.stringify(meta);
    console.log(process.env.STRIPE_SUCCESS_URL);

    console.log(lineItems);

    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_CANCELLED_URL,
        metadata: {
            'orders': metaData
        }
    }
    console.log("something!!!")
    // step 3: register the session
    // console.log(payment);
    let stripeSession = await Stripe.checkout.sessions.create(payment);
    // let stripeSession = await Stripe.checkout.sessions.create(payment);
    console.log("stripesession",stripeSession);

    // let stripeSession = await Stripe.checkout.sessions.create(payment)
    // console.log("bye!")
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
    // console.log("hello!")

})

router.get('/success', function(req,res){
    res.send('success!')
})

router.get('/cancelled', function(req,res){
    res.render('checkout/cancelled')
})

module.exports = router;