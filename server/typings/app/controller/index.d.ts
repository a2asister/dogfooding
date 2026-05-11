// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportNotification = require('../../../app/controller/notification');

declare module 'egg' {
  interface IController {
    notification: ExportNotification;
  }
}
