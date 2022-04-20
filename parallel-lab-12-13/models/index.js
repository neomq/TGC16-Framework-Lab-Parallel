const bookshelf = require('../bookshelf')

// A model represents one table
// create a new Posters model and store it in the Posters object
const Posters = bookshelf.model('Posters', {
    tableName:'posters',
    mediaproperty() {
        return this.belongsTo('MediaProperty')
    },
    tags() {
        return this.belongsToMany('Tag');
    }
});

const MediaProperty = bookshelf.model('MediaProperty',{
    tableName: 'media_properties',
    posters() {
        return this.hasMany('Posters');
    }
})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    posters() {
        return this.belongsToMany('Posters')
    }
})

const User = bookshelf.model('User',{
    tableName: 'users'
})

module.exports = { Posters, MediaProperty, Tag, User };