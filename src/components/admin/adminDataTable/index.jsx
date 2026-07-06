import AdminStatusBadge from "../adminStatusBadge";
import "./index.scss";

const AdminDataTable = ({
  columns,
  rows,
  emptyText = "Không có dữ liệu",
  rowKey = "id",
  onRowClick,
}) => (
  <div className="adm-table-wrap">
    <table className="adm-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={{ width: col.width }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="adm-table__empty">
              {emptyText}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr
              key={row[rowKey]}
              className={onRowClick ? "clickable" : ""}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(row)
                    : col.type === "status"
                      ? <AdminStatusBadge status={row[col.key]} />
                      : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default AdminDataTable;
