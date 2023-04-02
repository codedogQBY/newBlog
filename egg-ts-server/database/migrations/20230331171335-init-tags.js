'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, DATE, STRING, BIGINT, TEXT } = Sequelize;
    await queryInterface.createTable('tags', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: STRING, allowNull: false, comment: '标签名字'},
      descript: { type: STRING, allowNull: false, comment: '标签描述'},
      created_at: DATE,
      updated_at: DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tag');
  },
};
