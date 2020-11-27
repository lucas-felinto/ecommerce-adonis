'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class PasswordResetSchema extends Schema {
  up () {
    this.create('password_reset', (table) => {
      table.increments();
      table.string('email', 254).notNullable();
      table.foreign('email').references('email').inTable('user').onDelete('cascade');
      table.string('token').notNullable().unique();
      table.dateTime('expires_at');
      table.timestamps();
    });
  }

  down () {
    this.drop('password_reset');
  }
}

module.exports = PasswordResetSchema;
