import { useEffect, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { getStaffRoles, getStaffRolePermissions } from "../../../services/staffService";
import "./index.scss";

const StaffRoles = () => {
  const [roles, setRoles] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    Promise.all([getStaffRoles(), getStaffRolePermissions()]).then(([r, m]) => {
      setRoles(r);
      setMatrix(m);
      setLoading(false);
    });
  }, []);

  return (
    <div className="stf-roles">
      <StaffPageHeader
        kicker="Tra cứu"
        title="Vai trò & Quyền hạn"
        subtitle="Chỉ xem — không được tạo, sửa hoặc xoá vai trò."
      />

      {loading ? (
        <p className="stf-roles__empty">Đang tải...</p>
      ) : (
        <>
          <div className="stf-roles__table-wrap">
            <table className="stf-roles__table">
              <thead>
                <tr>
                  <th>Mã vai trò</th>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th>Số tài khoản</th>
                  <th>Loại</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td><code>{role.id}</code></td>
                    <td><strong>{role.name}</strong></td>
                    <td>{role.description}</td>
                    <td>{role.userCount.toLocaleString("vi-VN")}</td>
                    <td>{role.isSystem ? "Hệ thống" : "Tuỳ chỉnh"}</td>
                    <td>
                      <button type="button" className="stf-roles__view" onClick={() => setDetail(role)}>
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="stf-roles__matrix">
            <header>
              <h3>Ma trận phân quyền</h3>
              <p>Chế độ chỉ đọc — tham khảo quyền theo vai trò</p>
            </header>
            <div className="stf-roles__matrix-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Super Admin</th>
                    <th>Admin</th>
                    <th>Moderator</th>
                    <th>Finance</th>
                    <th>Support</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.module}>
                      <td>{row.module}</td>
                      <td className={row.superAdmin ? "yes" : "no"}>{row.superAdmin ? "✔" : "✖"}</td>
                      <td className={row.admin ? "yes" : "no"}>{row.admin ? "✔" : "✖"}</td>
                      <td className={row.moderator ? "yes" : "no"}>{row.moderator ? "✔" : "✖"}</td>
                      <td className={row.finance ? "yes" : "no"}>{row.finance ? "✔" : "✖"}</td>
                      <td className={row.support ? "yes" : "no"}>{row.support ? "✔" : "✖"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {detail && (
        <div className="stf-roles__overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-roles__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Chi tiết vai trò">
            <header>
              <h3>{detail.name}</h3>
              <button type="button" onClick={() => setDetail(null)}>✕</button>
            </header>
            <dl>
              <dt>Mã vai trò</dt><dd><code>{detail.id}</code></dd>
              <dt>Mô tả</dt><dd>{detail.description}</dd>
              <dt>Số tài khoản</dt><dd>{detail.userCount.toLocaleString("vi-VN")}</dd>
              <dt>Loại</dt><dd>{detail.isSystem ? "Vai trò hệ thống" : "Vai trò tuỳ chỉnh"}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRoles;
