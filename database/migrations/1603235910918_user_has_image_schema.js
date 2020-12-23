'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserImageSchema extends Schema {
  up () {
    this.table('user', (table) => {
      table.foreign('image_id').references('id').inTable('images').onDelete('cascade');
    });
  }

  down () {
    this.table('user', (table) => {
      table.dropForeign('image_id');
    });
  }
}

module.exports = UserImageSchema;
