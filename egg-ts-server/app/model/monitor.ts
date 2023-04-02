import { DataType } from 'sequelize-typescript';

const { INTEGER, STRING, DATE, TEXT, BIGINT } = DataType;

/**
 * @param {Egg.Application} app
 */
export default app => {
  const User = app.model.define('monitor', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    apikey: { type: STRING, comment: '应用名' },
    type: { type: STRING, comment: '上报类型' },
    time: { type: BIGINT, allowNull: false, comment: '上报时间' },
    message: { type: STRING, comment: '错误信息' },
    file_name: { type: STRING, comment: '错误文件名' },
    line: { type: INTEGER, comment: '错误行数' },
    column: { type: INTEGER, comment: '' },
    record_screen_id: { type: STRING, comment: '视频Id' },
    user_id: { type: STRING, comment: '' },
    sdk_version: { type: STRING, comment: 'SDK版本' },
    sdk_name: { type: STRING, comment: 'SDK名' },
    date: { type: STRING, comment: '上报日期' },
    uuid: { type: STRING, comment: '' },
    page_url: { type: STRING, comment: '上报页面' },
    device_info: { type: TEXT, comment: '上报设备信息' },
    breadcrumb: { type: TEXT, comment: '操作栈' },
    elapsed_time: { type: INTEGER, comment: '' },
    request: { type: STRING, comment: '请求信息' },
    response: { type: STRING, comment: '响应信息' },
    name: { type: STRING, comment: '性能优化名' },
    rating: { type: STRING, comment: '性能优化级别' },
    long_task: { type: TEXT, comment: '任务栈' },
    resource_list: { type: TEXT, comment: '资源列表' },
    events: { type: TEXT, comment: '视频信息' },
    created_at: DATE,
    updated_at: DATE,
  });

  return User;
};
