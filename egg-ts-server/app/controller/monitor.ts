import { Controller } from 'egg';
import { Op } from 'sequelize';
// type Monitor_type = 'recordScreen' | 'performance' | 'error';

// interface DEVICE_INFO {
//   browser: string,
//   browser_version: string,
//   device: string,
//   device_type: string,
//   os: string,
//   os_version: string,
//   ua: string
// }
//
// interface CRUMB {
//   category: string,
//   data: any,
//   status: string,
//   time: number,
//   type: string
// }
//
// interface REPORT_DATA {
//   apikey: string,
//   date: string,
//   deviceInfo: DEVICE_INFO,
//   fileName?: string,
//   breadcrumb?: CRUMB[],
//   line?: number,
//   message: string,
//   page_url: string,
//   recordScreenId: string,
//   sdkName: string,
//   sdkVersion: string,
//   status: string,
//   time: number,
//   type: string,
//   userId: string,
//   uuid: string,
//   events?: string,
//   value?: number,
//   name?: string
// }
//
// const MONITOR_ENUM: Record<string, Monitor_type> = {
//   RECORD_SCREEN: 'recordScreen',
//   PERFORMANCE: 'performance',
//   ERROR: 'error',
// };

export default class MonitorController extends Controller {
  async monitorReport() {
    const { ctx } = this;
    try {
      const data = ctx.request.body;
      const reportData = data;
      reportData.deviceInfo = reportData?.deviceInfo && JSON.stringify(reportData.deviceInfo);
      reportData.longTask = reportData?.longTask && JSON.stringify(reportData.longTask);
      reportData.breadcrumb = reportData?.breadcrumb && JSON.stringify(reportData.breadcrumb);
      reportData.resourceList = reportData?.resourceList && JSON.stringify(reportData.resourceList);
      // 防止首页加载太多资源
      reportData.resourceList = reportData?.resourceList?.length > 10240 ? '' : reportData.resourceList;
      await ctx.model.Monitor.create({
        ...ctx.helper.utils.humpToLineObject(reportData),
      });
      ctx.helper.response.handleSuccess({ ctx, msg: '', data: '上报成功' });
    } catch (e) {
      console.log(e);
      ctx.helper.response.handleSuccess({ ctx, msg: '', data: '上报失败', error: e });
    }
  }

  async getmap() {
    const { ctx } = this;
    try {
      // req.query 获取接口参数
      // const fileName = ctx.query.fileName;
      ctx.helper.response.handleSuccess({ ctx, msg: '获取map文件成功' });

    } catch (error) {
      ctx.helper.response.handleError({ ctx, msg: '获取map文件失败', error });
    }
  }

  async getRecordScreenById() {
    const { ctx } = this;
    try {
      const { id } = ctx.query;
      const data = await ctx.model.Monitor.findOne({
        where: {
          [Op.and]: [
            { record_screen_id: id },
            { type: 'recordScreen' },
          ],
        },
      });
      const events = data?.events;
      ctx.helper.response.handleSuccess({ ctx, msg: '获取视频数据成功', data: events });
    } catch (error) {
      ctx.helper.response.handleError({ ctx, msg: '获取视频数据失败', error });
    }
  }

  async getErrorList() {
    const { ctx } = this;
    try {
      const { pageNum, pageSize } = ctx.request.body;
      const total = (await ctx.model.Monitor.findAll({
        where: {
          type: 'error',
        },
      }))?.length || 0;
      const list = await ctx.model.Monitor.findAll({
        where: {
          [Op.or]: [{ type: 'error' }, { type: 'unhandledrejection' }],
        },
        order: [[ 'created_at', 'DESC' ]],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
      });
      const data = ctx.helper.utils.getPagination(
        list.map(item => {
          return ctx.helper.utils.lineToHumpObject(item);
        }),
        total,
        pageSize,
        pageNum,
      );
      ctx.helper.response.handleSuccess({ ctx, msg: '获取监控错误列表成功', data });
    } catch (error) {
      console.log(error);
      ctx.helper.response.handleError({ ctx, msg: '获取监控错误列表失败' });
    }
  }
}
