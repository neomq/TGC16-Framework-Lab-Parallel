const { CartItem } = require('../models');

const getCart = async (userId) => {
    return await CartItem.collection()
        .where({
            'user_id': userId
        }).fetch({
            require: false,
            withRelated: ['cartposter', 'cartposter.mediaproperty']
        });
}

const getCartItemByUserAndProduct = async (userId, posterId) => {
    return await CartItem.where({
        'user_id': userId,
        'poster_id': posterId
    }).fetch({
        require: false
    });
}

async function createCartItem(userId, posterId, quantity) {
    let cartItem = new CartItem({
        'user_id': userId,
        'poster_id': posterId,
        'quantity': quantity
    })
    await cartItem.save();
    return cartItem;
}

async function removeFromCart(userId, posterId) {
    let cartItem = await getCartItemByUserAndProduct(userId, posterId);
    if (cartItem) {
        await cartItem.destroy();
        return true;
    }
    return false;
}

async function updateQuantity(userId, posterId, newQuantity) {
    let cartItem = await getCartItemByUserAndProduct(userId, posterId);

    if (cartItem) {
        cartItem.set('quantity', newQuantity);
        cartItem.save();
        return true;
    }
    return false;
}

module.exports = { getCart, getCartItemByUserAndProduct, createCartItem, removeFromCart, updateQuantity }