// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportCourse = require('../../../app/model/course');

declare module 'egg' {
  interface IModel {
    Course: ReturnType<typeof ExportCourse>;
  }
}
