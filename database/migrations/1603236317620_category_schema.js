'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class CategorySchema extends Schema {
  up () {
    this.create('categorie', (table) => {
      table.increments();
      table.string('title', 100);
      table.string('description', 255);
      table.integer('image_id').unsigned();
      table.foreign('image_id').references('id').inTable('images').onDelete('cascade');
      table.timestamps();
    });
  }

  down () {
    this.drop('categorie');
  }
}

module.exports = CategorySchema;
