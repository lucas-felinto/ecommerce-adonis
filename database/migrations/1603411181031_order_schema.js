'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OrderSchema extends Schema {
  up () {
    this.create('order', (table) => {
      table.increments();
      table.decimal('total', 12, 2).defaultTo(0.0);
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('id').inTable('user').onDelete('cascade');
      table.enu('status', [
        'pending',
        'cancelled',
        'shipped',
        'paid',
        'finished'
      ]);
      table.timestamps();
    });
  }

  down () {
    this.drop('order');
  }
}

module.exports = OrderSchema;
