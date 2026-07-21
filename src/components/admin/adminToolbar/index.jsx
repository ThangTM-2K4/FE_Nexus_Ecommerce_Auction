import { FaSearch } from "react-icons/fa";
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
