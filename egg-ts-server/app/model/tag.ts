import { DataType } from 'sequelize-typescript';
const { INTEGER, STRING, DATE } = DataType;

/**
 * @param {Egg.Application} app
 */
export default app => {
  const Tag = app.model.define('Tag', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING, allowNull: false, comment: '标签名字' },
    descript: { type: STRING, allowNull: false, comment: '标签描述' },
    created_at: DATE,
    updated_at: DATE,
  });

  return Tag;
};
