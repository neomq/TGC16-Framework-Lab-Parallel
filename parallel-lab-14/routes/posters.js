const express = require("express");
const router = express.Router();

// import in Forms
const { bootstrapField, createPosterForm, createSearchForm } = require('../forms');
// import in CheckIfAuthenticated middleware
const { checkIfAuthenticated } = require('../middlewares');

// import in the DAL
const dataLayer = require('../dal/PosterServices')


// router.get('/', async (req,res)=>{
//     // fetch all the products (ie, SELECT * from products)
//     let posters = await Posters.collection().fetch({
//         withRelated:['mediaproperty', 'tags']
//     });
//     res.render('posters/index', {
//         'posters': posters.toJSON() // #3 - convert collection to JSON
//     })
// })

router.get('/', async (req, res) => {
  
    // 1. get all media properties
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    // 2. get all tags
    const allTags = await dataLayer.getAllTags();

    // 3. Create search form
    let searchForm = createSearchForm(allMediaProperties, allTags);

    searchForm.handle(req, {
        'empty': async (form) => {
            let posters = await dataLayer.getAllPosters();
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            let posters = await q.fetch({
                withRelated: ['mediaproperty', 'tags']
            })
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async (form) => {
            let q = await dataLayer.getAllPosters();

            if (form.data.title) {
                q = q.where('title', 'like', '%' + req.query.title + '%');
            }
            if (form.data.media_property_id) {
                q = q.where('media_property_id', '=', form.data.media_property_id);
            }
            if (form.data.min_cost_cents) {
                q = q.where('cost_cents', '>=', req.query.min_cost_cents);
            }
            if (form.data.max_cost_cents) {
                q = q.where('cost_cents', '<=', req.query.max_cost_cents);
            }
            if (form.data.tags) {
                q.query('join', 'posters_tags', 'posters.id', 'poster_id')
                    .where('tag_id', 'in', form.data.tags.split(','))
            }
            if (form.data.min_height_cm) {
                q = q.where('height_cm', '>=', req.query.min_height_cm)
            }
            if (form.data.max_height_cm) {
                q = q.where('height_cm', '<=', req.query.max_height_cm)
            }
            if (form.data.min_width_cm) {
                q = q.where('width_cm', '>=', req.query.min_width_cm)
            }
            if (form.data.max_width_cm) {
                q = q.where('width_cm', '<=', req.query.max_width_cm)
            }
            let posters = await q.fetch({
                withRelated: ['mediaproperty', 'tags']
            })
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// CREATE
// render form
router.get('/create', checkIfAuthenticated, async (req, res) => {

    // 1. get all media properties
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    // 2. get all tags
    const allTags = await dataLayer.getAllTags();

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
    
    // 1. get all media properties
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    // 2. get all tags
    const allTags = await dataLayer.getAllTags();

    const posterForm = createPosterForm( allMediaProperties, allTags );
    posterForm.handle(req, {
        'success': async (form) => {

            await dataLayer.addPoster(form);

            req.flash("success_messages", `New Poster created!`)

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
    // const poster = await Posters.where({
    //     'id': posterId
    // }).fetch({
    //     require: true,
    //     withRelated:['tags', 'mediaproperty']
    // });
    const poster = await dataLayer.findPoster(req.params.poster_id);

    // 1. get all media properties
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    // 2. get all tags
    const allTags = await dataLayer.getAllTags();

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

    // 1. get all media properties
    const allMediaProperties = await dataLayer.getAllMediaProperties();

    // 2. get all tags
    const allTags = await dataLayer.getAllTags();

    // fetch the product that we want to update
    // const poster = await Posters.where({
    //     'id': req.params.poster_id
    // }).fetch({
    //     require: true,
    //     withRelated: ['tags', 'mediaproperty']
    // });
    const poster = await dataLayer.findPoster(req.params.poster_id);

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
    // const poster = await Posters.where({
    //     'id': req.params.poster_id
    // }).fetch({
    //     require: true
    // });
    const poster = await dataLayer.findPoster(req.params.poster_id);

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })

});

// process delete
router.post('/:poster_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    // const poster = await Posters.where({
    //     'id': req.params.poster_id
    // }).fetch({
    //     require: true
    // });
    const poster = await dataLayer.findPoster(req.params.poster_id);

    await poster.destroy();
    res.redirect('/posters')
})

module.exports = router;