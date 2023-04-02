// This file is created by egg-ts-helper@1.33.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportMenu from '../../../app/model/menu';
import ExportMonitor from '../../../app/model/monitor';
import ExportRole from '../../../app/model/role';
import ExportTag from '../../../app/model/tag';
import ExportUser from '../../../app/model/user';

declare module 'egg' {
  interface IModel {
    Menu: ReturnType<typeof ExportMenu>;
    Monitor: ReturnType<typeof ExportMonitor>;
    Role: ReturnType<typeof ExportRole>;
    Tag: ReturnType<typeof ExportTag>;
    User: ReturnType<typeof ExportUser>;
  }
}
