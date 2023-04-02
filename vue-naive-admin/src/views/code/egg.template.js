// 首字母大写

const firstStrCase = (str) => {
  let tmp = str.toLowerCase()
  tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1)
  return tmp
}

// 驼峰转下划线
function toLine(name) {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}

// 生成动态字符
function getFieldTemplate(formItem) {
  const fieldTemplate = formItem.reduce((pre, cur, index) => {
    const str = `\t${toLine(cur.name)}: { type: ${cur.type},${cur.isNotNull ? ' allowNull: false,' : ''} comment: '${
      cur.remark
    }'},${index !== formItem.length - 1 ? '\n' : ''}`
    pre += str
    return pre
  }, '')
  return fieldTemplate
}

// 生成migrations代码模板
export const getMigrationsBaseTemplate = (modelName, formItem) => {
  const fieldTemplate = getFieldTemplate(formItem)
  return {
    language: 'javascript',
    fileName: `${modelName}\\migrations.js`,
    content: `'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, DATE, STRING, BIGINT, TEXT } = Sequelize;
    await queryInterface.createTable('${modelName.toLowerCase()}s', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      ${fieldTemplate}
      created_at: DATE,
      updated_at: DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('${modelName.toLowerCase()}');
  },
};
`,
  }
}

// 生成model代码模板
export const getModelBaseTemplate = (modelName, formItem) => {
  const fieldTemplate = getFieldTemplate(formItem)
  return {
    language: 'typescript',
    fileName: `model\\${modelName}.ts`,
    content: `import { DataType } from 'sequelize-typescript';
const { INTEGER, STRING, DATE, TEXT, BIGINT } = DataType;

/**
 * @param {Egg.Application} app
 */
export default app => {
  const ${firstStrCase(modelName)} = app.model.define('${firstStrCase(modelName)}', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    ${fieldTemplate}
    created_at: DATE,
    updated_at: DATE,
  });

  return ${firstStrCase(modelName)};
};
`,
  }
}

// 生成路由模板
export const getRouteBaseTemplate = (modelName, modelCnName) => {
  return {
    language: 'typescript',
    fileName: `router\\${modelName}.ts`,
    content: `
    // ${modelCnName}相关
     router.post('/api/v1/system/${modelName.toLowerCase()}/add', verifyToken, controller.${modelName.toLowerCase()}.add${firstStrCase(
      modelName
    )});
     router.get('/api/v1/system/${modelName.toLowerCase()}/delete${firstStrCase(
      modelName
    )}ByIds', verifyToken, controller.${modelName.toLowerCase()}.delete${firstStrCase(modelName)}ByIds);
     router.post('/api/v1/system/${modelName.toLowerCase()}/edit${firstStrCase(
      modelName
    )}ById', verifyToken, controller.${modelName.toLowerCase()}.edit${firstStrCase(modelName)}ById);
     router.post('/api/v1/system/${modelName.toLowerCase()}/list', verifyToken, controller.${modelName.toLowerCase()}.list);
  `,
  }
}

// 生成controller模板
export const getControllerBaseTemplate = (modelName, modelCnName, formItem) => {
  const whereParam = formItem.reduce((pre, cur) => {
    // 数据类类型用等于，字符类型用like
    if (cur.isSelect) {
      if (cur.type === 'STRING' || cur.type === 'TEXT') {
        pre += `\t${toLine(cur.name)}:{[Op.like]:\`%\$\{${cur.name} || ''\}%\`},\n`
      }
      if (cur.type === 'INTEGER') {
        pre += `\t${toLine(cur.name)}:${cur.name},\n`
      }
    }
    return pre
  }, '')

  // 找出所有字段
  const allParams = formItem.reduce((pre, cur) => {
    pre.push(cur.name)
    return pre
  }, [])

  // 找出需要查询的字段
  const searchParams = formItem.reduce((pre, cur) => {
    if (cur.isSelect) {
      pre.push(cur.name)
    }
    return pre
  }, [])

  // 添加记录时更新的字段
  const editParams = formItem.reduce((pre, cur) => {
    pre += `\t${toLine(cur.name)}: ${cur.name},\n`
    return pre
  }, '')

  return {
    language: 'typescript',
    fileName: `controller\\${modelName}.ts`,
    content: `import { Controller } from 'egg';
import { Op } from 'sequelize';

export default class ${firstStrCase(modelName)}Controller extends Controller {
  // 获取${modelCnName}列表
  public async list() {
    const ctx = this.ctx;
    try {
      const { pageNum, pageSize, params } = ctx.request.body;
      const { ${searchParams.join(', ')} } = params;
      // 获取列表
      const all${firstStrCase(modelName)} = await ctx.model.${firstStrCase(modelName)}.findAll({where: {
      ${whereParam}
  }, order: [[ 'updated_at', 'DESC' ]] });
      // 转换驼峰
      const ${modelName.toLowerCase()}List = all${firstStrCase(
      modelName
    )}.map(item => ctx.helper.utils.lineToHumpObject(item));
      // 获取成功
      const data = ctx.helper.response.getPagination(${modelName.toLowerCase()}List, ${modelName.toLowerCase()}List.length, pageSize, pageNum);
      ctx.helper.response.handleSuccess({ ctx, msg: '获取${modelCnName}列表成功', data });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '获取${modelCnName}列表失败' });
    }
  }

  // 添加${modelCnName}记录列表
  public async add${firstStrCase(modelName)}() {
    const ctx = this.ctx;
    try {
      const { ${allParams.join(', ')} } = ctx.request.body;
      await ctx.model.${firstStrCase(modelName)}.create({
        ${editParams}
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '添加${modelCnName}成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '添加${modelCnName}失败' });
    }
  }

  // 删除${modelCnName}
  async delete${firstStrCase(modelName)}ByIds() {
    const ctx = this.ctx;
    try {
      const { ids } = ctx.request.query;
      const idList = ids.split(',');
      await ctx.model.${firstStrCase(modelName)}.destroy({
        where: {
          id: {
            [Op.in]: idList,
          },
        },
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '删除${modelCnName}成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '删除${modelCnName}失败' });
    }
  }
  
  // 编辑${modelCnName}
  async edit${firstStrCase(modelName)}ById() {
    const ctx = this.ctx;
    try {
      const { id, ${allParams.join(', ')} } = ctx.request.body;
      await ctx.model.${firstStrCase(modelName)}.update({
        ${editParams}
      }, {
        where: {
          id,
        },
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '更新${modelCnName}成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '更新${modelCnName}失败' });
    }
  }
}`,
  }
}
