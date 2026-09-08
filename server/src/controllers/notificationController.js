import { Notification } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

/** GET /api/v1/notifications */
export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(100);
  ok(res, notifications, 'Notifications fetched');
});

/** PATCH /api/v1/notifications/:id/read */
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return fail(res, 'Notification not found', 404);
  ok(res, notification, 'Notification marked as read');
});

/** PATCH /api/v1/notifications/read-all */
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  ok(res, null, 'All notifications marked as read');
});
