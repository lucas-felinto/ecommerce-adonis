'use strict';

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.group(() => {
  // Categories routes resource
  Route.resource('categories', 'CategoryController').apiOnly();
  // Products routes resource
  Route.resource('coupon', 'CouponController').apiOnly();
  // Products routes resource
  Route.resource('image', 'ImageController').apiOnly();
  // Products routes resource
  Route.resource('order', 'OrderController').apiOnly();
  // Products routes resource
  Route.resource('products', 'ProductController').apiOnly();
  // Products routes resource
  Route.resource('user', 'UserController').apiOnly();
})
  .prefix('v1/admin')
  .namespace('Admin');