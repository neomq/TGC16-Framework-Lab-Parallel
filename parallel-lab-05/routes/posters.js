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

// CREATE
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

// UPDATE
router.get('/:poster_id/update', async (req, res) => {
    // retrieve the product
    const posterId = req.params.poster_id
    const poster = await Posters.where({
        'id': posterId
    }).fetch({
        require: true
    });

    const posterForm = createPosterForm();

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost_cents.value = poster.get('cost_cents');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height_cm.value = poster.get('height_cm');
    posterForm.fields.width_cm.value = poster.get('width_cm');

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })
})

// process update
router.post('/:poster_id/update', async (req, res) => {
    // fetch the product that we want to update
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    // process the form
    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            poster.set(form.data);
            poster.save();
            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
    })

})

// DELETE
router.get('/:poster_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })

});

// process delete
router.post('/:poster_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });
    await poster.destroy();
    res.redirect('/posters')
})

module.exports = router;