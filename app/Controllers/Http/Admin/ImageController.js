'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Image = use('App/Models/Image');
const { manage_single_upload, manage_multiple_upload } = use('App/Helpers');
const fs = use('fs');

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination }) {
    const images = await Image.query()
      .orderBy('id', 'desc')
      .paginate(pagination.page, pagination.limit);

    return response.status(200).json(images);
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    try {
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb' 
      });

      let images = [];

      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar);
        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          });

          images.push(image);

          return response.status(201).json({ sucesses: images, errors: {} });
        }

        return response.status(400).json({ 
          message: 'Não foi possivel processar as imagens no momento' 
        });
      } else {
        let files = await manage_multiple_upload(fileJar);

        await Promise.all(
          files.sucesses.map(async file => {
            const image = await Image.create({
              path: file.fileName,
              size: file.size,
              original_name: file.clientName,
              extension: file.subtype
            });

            images.push(image);
          })
        );

        return response.status(201).json({ sucesses: images, errors: {} });
      }
    } catch (e) {
      return response.status(400).json({
        message: 'Não foi possivel processar as imagens no momento' 
      });
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response }) {
    const image = await Image.findOrFail(params.id);

    return response.status(200).json(image);
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response }) {
    try {
      const original_name = request.only(['original_name']);
      const image = await Image.findOrFail(id);

      image.merge(original_name);
      await image.save();

      return response.status(200).json(image);
    } catch (e) {
      return response.status(400).json({
        message: 'Erro' 
      });
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    try {
      const image = await Image.findOrFail(id);
      let filepath = Helpers.publicpath(`uploads/${image.path}`);
      
      await fs.unlink(filepath, err => {
        if (!err) image.delete();
      });

      return response.status(204).json();
    } catch (e) {
      return response.status(400).json({
        message: 'Erro' 
      });
    }
  }
}

module.exports = ImageController;
