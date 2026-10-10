/**
 * Single entry point for all data access.
 *
 *   import { api } from '../api';
 *   const classes = await api.classes.list({ teacherId });
 *
 * Every function returns a Promise. When the backend is ready, re-implement
 * these modules with Axios calls (same names, same return shapes) and the
 * pages will keep working unchanged.
 */
import * as auth from './auth';
import * as users from './users';
import * as classes from './classes';
import * as materials from './materials';
import * as assignments from './assignments';
import * as submissions from './submissions';
import * as grades from './grades';
import * as attendance from './attendance';
import * as payments from './payments';
import * as announcements from './announcements';
import * as forum from './forum';
import * as notifications from './notifications';
import * as audit from './audit';
import * as settings from './settings';
import * as backups from './backups';
import * as dashboard from './dashboard';
import * as timetable from './timetable';
import * as search from './search';

export const api = {
  auth,
  users,
  classes,
  materials,
  assignments,
  submissions,
  grades,
  attendance,
  payments,
  announcements,
  forum,
  notifications,
  audit,
  settings,
  backups,
  dashboard,
  timetable,
  search,
};

export default api;
