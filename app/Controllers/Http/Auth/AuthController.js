'use strict';
const Databse = use('Database');
const User = use('App/Models/User');
const Role = use('Role');

class AuthController {
  async register ({ request, response }) {
    const trx = await Databse.beginTransaction();

    try {
      const { name, surname, email, password } = request.all();
      const userRole = await Role.findBy('slug', 'client');
      
      const user = await User.create({ name, surname, email, password }, trx);
      await user.roles().attach([userRole.id], null, trx);

      await trx.commit();

      return response.status(201).send({ data: user });
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({ 
        message: 'Erro ao realizar cadastro', 
        errorMessage: e.message 
      });
    }
  }

  async login ({ request, response, auth }) {
    const { email, password } = request.all();

    let data = await auth.withRefreshToken().attempt(email, password);
    return response.status(200).send({ data });
  }

  async refresh ({ request, response, auth }) {
    let refresh_token = request.input('refresh_token');

    if (!refresh_token) {
      refresh_token = request.header('refresh_token');
    }

    const user = await auth.newRefreshToken().generateForRefreshToken(refresh_token);

    return response.status(200).send({ data: user });
  }

  async logout ({ request, response, auth }) {
    let refresh_token = request.input('refresh_token');

    if (!refresh_token) {
      refresh_token = request.header('refresh_token');
    }

    await auth.authenticator('jwt').revokeTokens([refresh_token], true);
    return response.status(204).send({});
  }

  async forgot ({ request, response }) {
    //
  }

  async remember ({ request, response }) {
    //
  }

  async reset ({ request, response }) {
    //
  }
}

module.exports = AuthController;
