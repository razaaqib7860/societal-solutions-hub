import { AuditLog } from '../models/index.js';

/**
 * Records an administrative/system action to the audit trail.
 * Non-blocking: failures are logged but never break the request flow.
 */
export async function recordAudit({ actor, action, entityType, entityId, meta }) {
  try {
    await AuditLog.create({ actor, action, entityType, entityId, meta });
  } catch (err) {
    console.error('[auditLog] failed to record audit entry:', err.message);
  }
}

/** Express middleware factory: records an audit entry after a successful response. */
export const auditLog = (action, entityType) => (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode < 400 && req.user) {
      recordAudit({
        actor: req.user._id,
        action,
        entityType,
        entityId: req.params.id,
        meta: { method: req.method, path: req.originalUrl },
      });
    }
  });
  next();
};

export default auditLog;
