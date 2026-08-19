import * as logsService from './logs.service.js';

export async function listLogsController(req, res, next) {
  try {
    const { search, action, userId, dateFrom, dateTo, page, limit } = req.query;
    const result = await logsService.listActivityLogs({
      search,
      action,
      userId: userId ? Number(userId) : undefined,
      dateFrom,
      dateTo,
      page,
      limit,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
