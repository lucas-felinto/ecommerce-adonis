'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon');
const Database = use('Database');
const Service = use('App/Services/Coupon/CouponService');

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {object} ctx.pagination
   */
  async index ({ request, response, view, pagination }) {
    const code = request.input('code');
    const query = Coupon.query();
    
    if (code) {
      query.where('code', 'LIKE', `%${code}%`);
    }

    const coupons = await query.paginate(pagination.page, pagination.limit);

    return response.status(200).send(coupons);
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    /**
     * 1 - Produto - utilizado apenas em produtos especfícos
     * 2 - Clientes - utilizado apenas em clientes especfícos
     * 3 - Produtos e Clientes
     * 4 - Utilizado em qualquer
     */

    const trx = await Database.beginTransaction();

    var canUseFor = {
      client: false,
      product: false
    };

    try {
      const couponData = request.only([
        'code',
        'discount', 
        'valid_from', 
        'valid_until', 
        'quantity', 
        'type', 
        'recursive'
      ]);

      const { users, products } = request.only(['users', 'products']);

      const coupon = await Coupon.create(couponData, trx);

      const service = new Service(coupon, trx);

      if (users && users.length) {
        await service.syncUsers(users);
        canUseFor.client = true;
      }

      if (products && products.length) {
        await service.syncProducts(products);
        canUseFor.product = true;
      }

      if (canUserFor.product && canUserFor.client) {
        coupon.can_use_for = 'product_client';
      } else if (canUserFor.product && !canUserFor.client) {
        coupon.can_use_for = 'product';
      } else if (!canUserFor.product && canUserFor.client) {
        coupon.can_use_for = 'client';
      } else {
        coupon.can_use_for = 'all';
      }

      await coupon.save(trx);
      await trx.commit();

      return response.status(201).send(coupon);
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({
        message: e.message
      });
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, request, response }) {
    const coupon = await Coupon.findOrFail(id);

    return response.status(200).send(coupon);
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction();

    var canUseFor = {
      client: false,
      product: false
    };
    
    try {
      const coupon = await Coupon.findOrFail(id);

      const couponData = request.only([
        'code',
        'discount', 
        'valid_from', 
        'valid_until', 
        'quantity', 
        'type', 
        'recursive'
      ]);

      const { users, products } = request.only(['users', 'products']);
      
      const service = new Service(coupon, trx);
      
      if (users && users.length) {
        await service.syncUsers(users);
        canUseFor.client = true;
      }
      
      if (products && products.length) {
        await service.syncProducts(products);
        canUseFor.product = true;
      }
      
      if (canUserFor.product && canUserFor.client) {
        coupon.can_use_for = 'product_client';
      } else if (canUserFor.product && !canUserFor.client) {
        coupon.can_use_for = 'product';
      } else if (!canUserFor.product && canUserFor.client) {
        coupon.can_use_for = 'client';
      } else {
        coupon.can_use_for = 'all';
      }
      
      coupon.merge(couponData);

      await coupon.save(trx);
      await trx.commit();

      return response.status(200).send(coupon);
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({
        message: e.message
      });
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction();
    
    try {

      const coupon = await Coupon.findOrFail(id);

      await coupon.products().detach([], trx);
      await coupon.orders().detach([], trx);
      await coupon.users().detach([], trx);

      await coupon.delete(trx);
      await trx.commit();

      return response.status(204).send({});
    } catch (e) {
      await trx.rollback();
      return response.status(400).send({
        message: e.message
      });
    }
  }
}

module.exports = CouponController;
