'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('posters',{
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    title: {
      type: 'string',
      length: 100,
      notNull: true
    },
    cost_cents: {
      type: 'int',
      unsigned: true,
      notNull: true
    },
    description: {
      type: 'text',
      notNull: true
    },
    date: {
      type: 'date',
      notNull: true
    },
    stock: {
      type: 'int',
      unsigned: true,
      default: 0,
      unsigned: true,
      notNull: true
    },
    height_cm: {
      type: 'int',
      unsigned: true,
      notNull: true
    },
    width_cm: {
      type: 'int',
      unsigned: true,
      notNull: true
    }
  })
};

exports.down = function(db) {
  return db.dropTable('posters');
};

exports._meta = {
  "version": 1
};
