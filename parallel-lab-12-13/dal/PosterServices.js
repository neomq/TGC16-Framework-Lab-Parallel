// import in models from the models module
const { Posters, MediaProperty, Tag } = require('../models')

// Functions:
// 1. get all the posters
async function getAllPosters() {
    let allPosters = await Posters.fetchAll({
        withRelated: ['mediaproperty', 'tags']
    })
    return allPosters;
}

// 2. retrieve all the media properties
async function getAllMediaProperties() {
    const allMediaProperties = await MediaProperty.fetchAll().map((property) => {
        return [ property.get('id'),  property.get('name') ]
    })
    return allMediaProperties;
}

// 3. retrieve all tags
async function getAllTags() {
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);
    return allTags;
}

// 4. add a new poster to the database
async function addPoster(form) {

    let { tags, ...posterData } = form.data;
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

    return poster;
}

// 5. retrieve a poster by id
async function findPoster(id) {
    // eqv of select * from products where id = ${posterId}
    const poster = await Posters.where({
        'id': id
    }).fetch({
        'require': true, // will cause an error if not found
        'withRelated': ['mediaproperty', 'tags'] // load in the associated media property and tags
    })
    return poster;
}


module.exports = { getAllMediaProperties, getAllTags, findPoster, addPoster, getAllPosters }