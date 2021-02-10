'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order');
const Database = use('Database');
const OrderService = use('App/Services/OrderService');

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index ({ request, response, view, pagination }) {
    const { status, id } = request.only(['status', 'id']);
    const query = Order.query();
    
    if (status && id) {
      query.where('status', status);
      query.orWhere('id', id);
    } else if (status) {
      query.where('status', status);
    } else if (id) {
      query.where('id', id);
    }

    const orders = await query.paginate(pagination.page, pagination.limit);

    return response.status(200).send(orders);
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const trx = await Database.beginTransaction();

    try {
      const { user_id, items, status } = request.all();
      const order = await Order.create({ user_id, items, status }, trx);

      const service = new OrderService(order, trx);

      if (items && items.lenth) {
        await service.syncItems(items);
      }

      await trx.commit();

      return response.status(201).send(order);
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({
        message: 'Erro ao processar solicitação'
      });
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id);

    return response.status(200).send(order);
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction();

    try {
      const { user_id, status } = request.all();
    
      const order = await Order.findOrFail(id);

      order.merge({ user_id,  status  });

      const service = new OrderService(order, trx);
      
      await service.updateItems(items);
      
      await order.save(trx);
      await trx.commit();
      
      return response.status(200).send(order);
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({
        message: 'Erro ao processar solicitação'
      });
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction();
    try {
      const order = await Order.findOrFail(id);

      await order.items().delete(trx);
      await order.coupons().delete(trx);
      await order.delete(trx);

      await trx.commit();
      
      return response.status(204).send({});
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({});
    }
  }
}

module.exports = OrderController;
