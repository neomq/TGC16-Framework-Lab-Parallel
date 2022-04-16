const bookshelf = require('../bookshelf')

// A model represents one table
// create a new Posters model and store it in the Posters object
const Posters = bookshelf.model('Posters', {
    tableName:'posters',
    mediaproperty() {
        return this.belongsTo('MediaProperty')
    }
});

const MediaProperty = bookshelf.model('MediaProperty',{
    tableName: 'media_properties',
    posters() {
        return this.hasMany('Posters');
    }
})

module.exports = { Posters, MediaProperty };