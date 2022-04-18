const express = require("express");
const router = express.Router();


// import in models from the models module
const { Posters, MediaProperty, Tag } = require('../models')
// import in Forms
const { bootstrapField, createPosterForm } = require('../forms');
// import in CheckIfAuthenticated middleware
const { checkIfAuthenticated } = require('../middlewares');


async function getAllMediaProperties() {
    const allMediaProperties = await MediaProperty.fetchAll().map((property) => {
        return [ property.get('id'),  property.get('name') ]
    })
    return allMediaProperties;
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);
    return allTags;
}

router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let posters = await Posters.collection().fetch({
        withRelated:['mediaproperty', 'tags']
    });
    res.render('posters/index', {
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
})

// CREATE
// render form
router.get('/create', checkIfAuthenticated, async (req, res) => {

    const allMediaProperties = await getAllMediaProperties();
    const allTags = await getAllTags();

    const posterForm = createPosterForm( allMediaProperties, allTags );
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})
// process form
router.post('/create', checkIfAuthenticated, async(req,res)=>{
    
    const allMediaProperties = await getAllMediaProperties();
    const allTags = await getAllTags();

    const posterForm = createPosterForm( allMediaProperties, allTags );
    posterForm.handle(req, {
        'success': async (form) => {

            let {tags, ...posterData} = form.data;

            const poster = new Posters(posterData);

            poster.set('id', form.data.id);
            poster.set('title', form.data.title);
            poster.set('cost_cents', form.data.cost_cents);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('stock', form.data.stock);
            poster.set('height_cm', form.data.height_cm);
            poster.set('width_cm', form.data.width_cm);
            poster.set('media_property_id', form.data.media_property_id);

            await poster.save();

            // save the many to many relationship
            if (tags) {
                await poster.tags().attach(tags.split(","));
            }

            req.flash("success_messages", `New Poster: ${poster.get('title')} has been created`)

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField),
                cloudinaryName: process.env.CLOUDINARY_NAME,
                cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
                cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
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
        require: true,
        withRelated:['tags']
    });

    const allMediaProperties = await getAllMediaProperties();
    const allTags = await getAllTags();

    const posterForm = createPosterForm( allMediaProperties, allTags );

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost_cents.value = poster.get('cost_cents');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height_cm.value = poster.get('height_cm');
    posterForm.fields.width_cm.value = poster.get('width_cm');
    posterForm.fields.media_property_id.value = poster.get('media_property_id');
    // 1 - set the image url in the product form
    posterForm.fields.image_url.value = poster.get('image_url');

    // fill in the multi-select for the tags
    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags;

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON(),
        // 2 - send to the HBS file the cloudinary information
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

// process update
router.post('/:poster_id/update', async (req, res) => {

    const allMediaProperties = await getAllMediaProperties();
    const allTags = await getAllTags();

    // fetch the product that we want to update
    const poster = await Posters.where({
        'id': req.params.poster_id
    }).fetch({
        require: true,
        withRelated: ['tags']
    });

    // process the form
    const posterForm = createPosterForm( allMediaProperties, allTags );
    posterForm.handle(req, {
        'success': async (form) => {
            let { tags, ...posterData } = form.data;
            poster.set(posterData);
            poster.save();

            // update the tags
            let tagIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter( id => tagIds.includes(id) === false);
            await poster.tags().detach(toRemove);

            // add in all the tags selected in the form
            await poster.tags().attach(tagIds);

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField)
                // 'poster': poster.toJSON()
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