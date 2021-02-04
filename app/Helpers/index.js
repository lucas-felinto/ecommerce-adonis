'use strict';

const crypto = use('crypto');
const Helpers = use('Helpers');

/**
 * Generate random string
 * 
 * @param { int } length
 * @return { string }
 */

const randomString = async (length = 40) => {
  let string = '';
  let len = string.length;

  if (len < length) {
    let size = length - len;
    let bytes = await crypto.randomBytes(size);
    let buffer = Buffer.from(bytes);

    string += buffer
      .toString('base64')
      .replace(/[^a-zA-z0-9]/g, '')
      .substring(0, size);
  }

  return string;
};

/**
 * Move um único arquivo para o caminho especificado, se nenhum for 
 * então 'public/uploads' será utilizado
 * @param { FileJar } file
 * @param { string } path
 * @return { Object<FileJar> }
 */

const manage_single_upload = async (file, path = null) => {
  path = path ? path : Helpers.publicPath('uploads');

  const randomName = await randomString(30);
  let fileName = `${new Date().getTime()}-${randomName}.${file.subtype}`;

  await file.move(path, {
    name: fileName
  });

  return file;
};

/**
 * Move os arquivos para o caminho especificado, se nenhum for 
 * então 'public/uploads' será utilizado
 * @param { FileJar } fileJar
 * @param { string } path
 * @return { Object<FileJar> }
 */

const manage_multiple_upload = async (fileJar, path = null) => {
  path = path ? path : Helpers.publicPath('uploads');
  let sucesses = []; 
  let errors = [];

  await Promise.all(fileJar.files.map(async file => {
    let randomName = await randomString(30);

    let fileName = `${new Date().getTime()}-${randomName}.${file.subtype}`;

    await file.move(path, {
      name: fileName
    });

    file.moved() ? sucesses.push(file) : errors.push(file.error());
  }));
};

module.exports = { randomString, manage_single_upload, manage_multiple_upload };