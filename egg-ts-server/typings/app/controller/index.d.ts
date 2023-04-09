// This file is created by egg-ts-helper@1.33.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCommon from '../../../app/controller/common';
import ExportFile from '../../../app/controller/file';
import ExportHome from '../../../app/controller/home';
import ExportMenu from '../../../app/controller/menu';
import ExportMonitor from '../../../app/controller/monitor';
import ExportRole from '../../../app/controller/role';
import ExportTag from '../../../app/controller/tag';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    common: ExportCommon;
    file: ExportFile;
    home: ExportHome;
    menu: ExportMenu;
    monitor: ExportMonitor;
    role: ExportRole;
    tag: ExportTag;
    user: ExportUser;
  }
}
