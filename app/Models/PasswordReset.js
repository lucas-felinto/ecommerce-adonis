'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const { randomString } = use('App/Helpers');

class PasswordReset extends Model {
  static boot() {
    super.boot();

    this.addHook('beforeCreate', async model => {
      model.token = await randomString(25);

      const now = new Date();

      expires_at.setMinutes(now.getMinutes() + 30);

      model.expires_at = expires_at;
    });

  }

  // Formatar valores para padrão MySQL
  static get dates() {
    return ['created_at', 'updated_at', 'expires_at'];
  }

}

module.exports = PasswordReset;
