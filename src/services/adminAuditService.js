import api from "../config/api";
import { displayValue, formatDateTime } from "../utils/apiDisplay";
import { getApiErrorMessage, unwrapData, unwrapPagedList } from "../utils/apiResponse";

export { getApiErrorMessage };

export const mapAuditLog = (log) => {
  if (!log) return null;

  const entityType = log.entityType;
  const entityId = log.entityId ?? log.targetUserId ?? log.targetId;

  return {
    id: log.id,
    action: log.action,
    actorUserId: log.actorUserId,
    targetUserId: log.targetUserId,
    entityType,
    entityId,
    actor: log.actorName ?? log.actorUserName ?? log.actorUserId ?? "—",
    target: entityType
      ? `${entityType}${entityId ? ` · ${entityId}` : ""}`
      : displayValue(log.target),
    time: formatDateTime(log.createdAt ?? log.timestamp ?? log.occurredAt),
    oldValue: displayValue(log.oldValue ?? log.before ?? log.previousValue),
    newValue: displayValue(log.newValue ?? log.after ?? log.currentValue),
    ip: displayValue(log.ipAddress ?? log.ip),
    createdAt: log.createdAt,
    _raw: log,
  };
};

export const formatAuditLogDetail = (log) => {
  if (!log) return null;

  const mapped = mapAuditLog(log);

  return {
    id: mapped.id,
    "Hành động": displayValue(mapped.action),
    "Actor User ID": displayValue(mapped.actorUserId ?? log.actorUserId),
    "Target User ID": displayValue(mapped.targetUserId ?? log.targetUserId),
    "Loại entity": displayValue(mapped.entityType ?? log.entityType),
    "Entity ID": displayValue(mapped.entityId ?? log.entityId),
    "Thời gian": mapped.time,
    "Giá trị cũ": mapped.oldValue,
    "Giá trị mới": mapped.newValue,
    "IP": mapped.ip,
    _raw: log,
  };
};

export const getAdminAuditLogs = async ({
  action,
  actorUserId,
  targetUserId,
  entityType,
  fromUtc,
  toUtc,
  page = 1,
  pageSize = 20,
} = {}) => {
  const params = { page, pageSize };
  if (action) params.action = action;
  if (actorUserId) params.actorUserId = actorUserId;
  if (targetUserId) params.targetUserId = targetUserId;
  if (entityType) params.entityType = entityType;
  if (fromUtc) params.fromUtc = fromUtc;
  if (toUtc) params.toUtc = toUtc;

  const { data } = await api.get("/admin/audit-logs", { params });
  const paged = unwrapPagedList(data);

  return {
    ...paged,
    items: paged.items.map(mapAuditLog).filter(Boolean),
  };
};

export const getAdminAuditLogById = async (id) => {
  const { data } = await api.get(`/admin/audit-logs/${id}`);
  return unwrapData(data);
};
