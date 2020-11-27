'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class CouponProductSchema extends Schema {
  up () {
    this.create('coupon_product', (table) => {
      table.increments();
      table.integer('coupon_id').unsigned();
      table.foreign('coupon_id').references('id').inTable('coupon').onDelete('cascade');
      table.integer('product_id').unsigned();
      table.foreign('product_id').references('id').inTable('product').onDelete('cascade');
      table.timestamps();
    });
  }

  down () {
    this.drop('coupon_product');
  }
}

module.exports = CouponProductSchema;
