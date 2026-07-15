import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { getSystemEventLogs, getSystemEventLogDetail } from "../../../services/staffService";
import "./index.scss";

const StaffEventLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    getSystemEventLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((e) =>
      [e.id, e.action, e.actorName, e.entityType, e.entityId, e.detail, e.ip]
        .some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [logs, query]);

  const openDetail = async (event) => {
    const full = await getSystemEventLogDetail(event.id);
    setDetail(full || event);
  };

  return (
    <div className="stf-event-log">
      <StaffPageHeader
        kicker="Giám sát"
        title="Nhật ký sự kiện hệ thống"
        subtitle="Event Log — tra cứu hành động trên hệ thống để kiểm tra và đối soát."
      />

      <div className="stf-event-log__toolbar">
        <input
          type="search"
          placeholder="Tìm action, actor, entity, IP..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>{shown.length} sự kiện</span>
      </div>

      {loading ? (
        <p className="stf-event-log__empty">Đang tải...</p>
      ) : (
        <div className="stf-event-log__table-wrap">
          <table className="stf-event-log__table">
            <thead>
              <tr>
                <th>Mã sự kiện</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>Chi tiết</th>
                <th>Thời gian</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id}>
                  <td><code>{e.id}</code></td>
                  <td><span className="stf-event-log__action">{e.action}</span></td>
                  <td>{e.actorName}</td>
                  <td><small>{e.entityType} · {e.entityId}</small></td>
                  <td className="stf-event-log__detail">{e.detail}</td>
                  <td><small>{e.at}</small></td>
                  <td>
                    <button type="button" className="stf-event-log__view" onClick={() => openDetail(e)}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="stf-event-log__overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-event-log__panel" onClick={(ev) => ev.stopPropagation()} role="dialog">
            <header>
              <h3>Chi tiết sự kiện</h3>
              <button type="button" onClick={() => setDetail(null)}>✕</button>
            </header>
            <dl>
              <dt>Mã sự kiện</dt><dd><code>{detail.id}</code></dd>
              <dt>Action</dt><dd><code>{detail.action}</code></dd>
              <dt>Actor</dt><dd>{detail.actorName} ({detail.actor})</dd>
              <dt>Entity</dt><dd>{detail.entityType} · {detail.entityId}</dd>
              <dt>Chi tiết</dt><dd>{detail.detail}</dd>
              <dt>IP</dt><dd>{detail.ip}</dd>
              <dt>Thời gian</dt><dd>{detail.at}</dd>
              <dt>Giá trị cũ</dt><dd>{detail.oldValue ?? "—"}</dd>
              <dt>Giá trị mới</dt><dd>{detail.newValue ?? "—"}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffEventLog;
