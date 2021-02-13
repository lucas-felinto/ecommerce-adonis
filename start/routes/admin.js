'use strict';

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.group(() => {
  // Categories routes resource
  Route.resource('categories', 'CategoryController').apiOnly();

  // Coupon routes resource
  Route.resource('coupon', 'CouponController').apiOnly();

  // Image routes resource
  Route.resource('image', 'ImageController').apiOnly();

  // Order routes resource
  Route.post('orders/:id/discount', 'OrderController.applyDiscount');
  Route.delete('orders/:id', 'OrderController.removeDiscount');
  Route.resource('order', 'OrderController').apiOnly();

  // Products routes resource
  Route.resource('products', 'ProductController').apiOnly();

  // User routes resource
  Route.resource('user', 'UserController').apiOnly();

})
  .prefix('v1/admin')
  .namespace('Admin');