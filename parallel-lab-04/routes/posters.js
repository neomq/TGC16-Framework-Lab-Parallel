const express = require("express");
const router = express.Router();

// #1 import in the Posters model from the models module
const { Posters } = require('../models')

router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let posters = await Posters.collection().fetch();
    res.render('posters/index', {
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
})

module.exports = router;