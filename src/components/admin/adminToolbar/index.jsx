import { FaSearch, FaTh, FaList } from "react-icons/fa";
import Select from "../../common/select";
import "./index.scss";

// Mục value:"" là "bỏ lọc" — phải là option thật, không phải placeholder, nếu
// không chọn xong sẽ không có cách nào quay lại trạng thái không lọc.
const withClearOption = (f) => [{ value: "", label: f.label }, ...f.options];

const AdminToolbar = ({
  search = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  actions = [],
  viewMode,
  onViewModeChange,
}) => (
  <div className="adm-toolbar">
    <div className="adm-toolbar__left">
      {onSearchChange && (
        <div className="adm-toolbar__search">
          <FaSearch aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>
      )}
      {filters.map((f) => (
        <Select
          key={f.key}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          options={withClearOption(f)}
          placeholder={f.label}
          className="adm-toolbar__filter common-select--sm common-select--auto"
        />
      ))}
    </div>
    <div className="adm-toolbar__actions">
      {onViewModeChange && (
        <div className="adm-view-toggle" role="group" aria-label="Chế độ hiển thị">
          <button
            type="button"
            className={`adm-view-toggle__btn ${viewMode === "grid" ? "is-active" : ""}`}
            onClick={() => onViewModeChange("grid")}
            title="Hiển thị dạng Lưới"
          >
            <FaTh /> <span>Lưới</span>
          </button>
          <button
            type="button"
            className={`adm-view-toggle__btn ${viewMode === "list" ? "is-active" : ""}`}
            onClick={() => onViewModeChange("list")}
            title="Hiển thị dạng Danh sách"
          >
            <FaList /> <span>Danh sách</span>
          </button>
        </div>
      )}
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={`adm-toolbar__btn adm-toolbar__btn--${action.variant || "primary"}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

export default AdminToolbar;

