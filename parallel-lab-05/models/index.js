const bookshelf = require('../bookshelf')

// A model represents one table
// create a new Posters model and store it in the Posters object
const Posters = bookshelf.model('Posters', {
    tableName:'posters'
});

module.exports = { Posters };