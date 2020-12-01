'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class CouponUserSchema extends Schema {
  up () {
    this.create('coupon_user', (table) => {
      table.increments();
      table.integer('coupon_id').unsigned();
      table.foreign('coupon_id').references('id').inTable('coupon').onDelete('cascade');
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('id').inTable('user').onDelete('cascade');
      table.timestamps();
    });
  }

  down () {
    this.drop('coupon_user');
  }
}

module.exports = CouponUserSchema;