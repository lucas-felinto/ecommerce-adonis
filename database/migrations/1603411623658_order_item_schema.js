'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OrderItemSchema extends Schema {
  up () {
    this.create('order_item', (table) => {
      table.increments();
      table.integer('product_id').unsigned();
      table.foreign('product_id').references('id').inTable('products').onDelete('cascade');
      table.integer('quantity').unsigned();
      table.decimal('subtotal', 12, 2);
      table.integer('order_id').unsigned();
      table.foreign('order_id').references('id').inTable('order').onDelete('cascade');
      table.timestamps();
    });
  }

  down () {
    this.drop('order_item');
  }
}

module.exports = OrderItemSchema;
