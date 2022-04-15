const express = require("express");
const router = express.Router();

// #1 import in the Posters model from the models module
const { Posters } = require('../models')

// import in the Forms
const { bootstrapField, createPosterForm } = require('../forms');

router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let posters = await Posters.collection().fetch();
    res.render('posters/index', {
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
})

// render form
router.get('/create', async (req, res) => {
    const posterForm = createPosterForm();
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField)
    })
})

// process form
router.post('/create', async(req,res)=>{
    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            const poster = new Posters();
            poster.set('id', form.data.id);
            poster.set('title', form.data.title);
            poster.set('cost_cents', form.data.cost_cents);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('stock', form.data.stock);
            poster.set('height_cm', form.data.height_cm);
            poster.set('width_cm', form.data.width_cm);
            await poster.save();
            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;