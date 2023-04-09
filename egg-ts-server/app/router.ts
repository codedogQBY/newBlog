import { Application } from 'egg';
import verify from './middleware/verifyToken';

export default (app: Application) => {
  const { controller, router } = app;
  const verifyToken = verify(app.config.jwt);

  // 权限相关
  router.get('/heart', controller.home.index);
  router.post('/api/v1/system/auth/register', controller.user.register);
  router.post('/api/v1/system/auth/sendCodeEmail', controller.user.sendCodeEmail);
  router.post('/api/v1/system/auth/login', controller.user.login);
  router.get('/api/v1/system/auth/logout', controller.user.logout);
  router.get('/api/v1/system/common/code', controller.user.getCode);
  router.post('/api/v1/system/auth/refreshToken', controller.user.refreshToken);

  // 用户相关
  router.get('/api/v1/system/user/getUserInfo', verifyToken, controller.user.getUserInfo);
  router.post('/api/v1/system/user/editUserById', verifyToken, controller.user.editUser);
  router.post('/api/v1/system/user/editInfo', verifyToken, controller.user.editUserInfo);
  router.post('/api/v1/system/user/getUserMenu', verifyToken, controller.user.getUserMenu);
  router.post('/api/v1/system/user/list', verifyToken, controller.user.getUserList);
  router.get('/api/v1/system/user/query', verifyToken, controller.user.query);
  router.post('/api/v1/system/user/add', verifyToken, controller.user.addUser);
  router.post('/api/v1/system/user/editPassword/email', verifyToken, controller.user.editPasswordEmail);
  router.post('/api/v1/system/user/editPassword', verifyToken, controller.user.editPassword);
  router.get('/api/v1/system/user/deleteUserByIds', verifyToken, controller.user.deleteUserByIds);


  // 角色相关
  router.post('/api/v1/system/role/add', verifyToken, controller.role.add);
  router.get('/api/v1/system/role/delete', verifyToken, controller.role.delete);
  router.post('/api/v1/system/role/edit', verifyToken, controller.role.edit);
  router.post('/api/v1/system/role/editPermission', verifyToken, controller.role.editPermission);
  router.get('/api/v1/system/role/getRoleMap', verifyToken, controller.role.getRoleMap);
  router.post('/api/v1/system/role/list', verifyToken, controller.role.list);

  // 菜单相关
  router.post('/api/v1/system/menu/add', verifyToken, controller.menu.add);
  router.get('/api/v1/system/menu/delete', verifyToken, controller.menu.delete);
  router.post('/api/v1/system/menu/edit', verifyToken, controller.menu.edit);
  router.get('/api/v1/system/menu/getMenuMap', verifyToken, controller.menu.getMenuMap);
  router.post('/api/v1/system/menu/list', verifyToken, controller.menu.list);

  // 上传文件
  router.post('/api/v1/system/common/upload/img', verifyToken, controller.file.uploadImg);

  // 告警相关
  router.post('/api/v1/monitor/monitorReport', controller.monitor.monitorReport);
  router.post('/api/v1/monitor/getErrorList', controller.monitor.getErrorList);
  router.get('/api/v1/monitor/getRecordScreenById', controller.monitor.getRecordScreenById);


  // 标签相关
  router.post('/api/v1/system/tag/add', verifyToken, controller.tag.addTag);
  router.get('/api/v1/system/tag/deleteTagByIds', verifyToken, controller.tag.deleteTagByIds);
  router.post('/api/v1/system/tag/editTagById', verifyToken, controller.tag.editTagById);
  router.post('/api/v1/system/tag/list', verifyToken, controller.tag.list);

  // chatGpt相关
  router.post('/api/v1/common/chatgpt/answer',verifyToken, controller.common.getAnswer);
};
