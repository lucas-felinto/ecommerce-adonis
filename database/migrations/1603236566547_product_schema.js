'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProductSchema extends Schema {
  up () {
    this.create('product', (table) => {
      table.increments();
      table.string('name', 100);
      table.integer('image_id').unsigned();
      table.foreign('image_id').references('id').inTable('images').onDelete('cascade');
      table.text('description');
      table.decimal('price', 12, 2);
      table.timestamps();
    });

    this.create('image_product', (table) => {
      table.increments();
      table.integer('image_id').unsigned();
      table.integer('product_id').unsigned();
      table.foreign('image_id').references('id').inTable('images').onDelete('cascade');
    });

    this.create('category_product', (table) => {
      table.increments();
      table.integer('product_id').unsigned();
      table.foreign('product_id').references('id').inTable('product').onDelete('cascade');
      table.integer('category_id').unsigned();
      table.foreign('category_id').references('id').inTable('categories').onDelete('cascade');
    });
  }

  down () {
    this.drop('category_product');
    this.drop('image_product');
    this.drop('product');
  }
}

module.exports = ProductSchema;
