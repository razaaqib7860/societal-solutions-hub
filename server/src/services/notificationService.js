import { Notification } from '../models/index.js';

/** Creates a notification for a single recipient. */
export async function notifyUser({ recipient, title, message, type = 'SYSTEM', link, meta }) {
  return Notification.create({ recipient, title, message, type, link, meta });
}

/** Creates the same notification for multiple recipients. */
export async function notifyMany(recipients = [], payload) {
  const docs = recipients.filter(Boolean).map((recipient) => ({ ...payload, recipient }));
  if (!docs.length) return [];
  return Notification.insertMany(docs);
}

export default { notifyUser, notifyMany };
