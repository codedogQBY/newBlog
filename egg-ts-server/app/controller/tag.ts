import { Controller } from 'egg';
import { Op } from 'sequelize';

export default class TagController extends Controller {
  // 获取标签列表
  public async list() {
    const ctx = this.ctx;
    try {
      const { pageNum, pageSize, params } = ctx.request.body;
      const { name } = params;
      // 获取列表
      const allTag = await ctx.model.Tag.findAll({ where: {
        name: { [Op.like]: `%${name || ''}%` },
      }, order: [[ 'updated_at', 'DESC' ]] });
      // 转换驼峰
      const tagList = allTag.map(item => ctx.helper.utils.lineToHumpObject(item));
      // 获取成功
      const data = ctx.helper.response.getPagination(tagList, tagList.length, pageSize, pageNum);
      ctx.helper.response.handleSuccess({ ctx, msg: '获取标签列表成功', data });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '获取标签列表失败' });
    }
  }

  // 添加标签记录列表
  public async addTag() {
    const ctx = this.ctx;
    try {
      const { name, descript } = ctx.request.body;
      await ctx.model.Tag.create({
        name,
        descript,

      });
      ctx.helper.response.handleSuccess({ ctx, msg: '添加标签成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '添加标签失败' });
    }
  }

  // 删除标签
  async deleteTagByIds() {
    const ctx = this.ctx;
    try {
      const { ids } = ctx.request.query;
      const idList = ids.split(',');
      await ctx.model.Tag.destroy({
        where: {
          id: {
            [Op.in]: idList,
          },
        },
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '删除标签成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '删除标签失败' });
    }
  }

  // 编辑标签
  async editTagById() {
    const ctx = this.ctx;
    try {
      const { id, name, descript } = ctx.request.body;
      await ctx.model.Tag.update({
        name,
        descript,

      }, {
        where: {
          id,
        },
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '更新标签成功' });
    } catch (e) {
      console.error(e);
      ctx.helper.response.handleError({ ctx, msg: '更新标签失败' });
    }
  }
}
