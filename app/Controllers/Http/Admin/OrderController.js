'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order');
const Coupon = use('App/Model/Coupon');
const Discount = use('App/Model/Discount');
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

  async applyDiscount ({ params: { id }, request, response }) {
    try {
      var discount, info = {};
      const { code } = request.all();

      const coupon = await Coupon.findOrFail('code', code.toUpperCase());
      const order = await Order.findOrFail(id);
      const service = new OrderService(order);
      const canAddDiscount = await service.canApplyDiscount(coupon);
      const orderDiscounts = await order.coupons().getCount();
      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive);

      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        });
        info.message = 'Cupom Aplicado Com Sucesso!';
        info.success = true;
      } else {
        info.message = 'Não foi possivel aplicar o cupom';
        info.success = false;
      }

      return response.status(200).send({ order, info });
    } catch (e) {
      return response.status(400).send({ message: 'Erro!' });
    }
  }

  async removeDiscount ({ request, response }) {
    const { discount_id } = request.all();
    const discount = await Discount.findOrFail(discount_id);
    await discount.delete();

    return response.status(204).send();
  }
}

module.exports = OrderController;
