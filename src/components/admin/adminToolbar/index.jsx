import { FaSearch } from "react-icons/fa";
import "./index.scss";

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
        <select
          key={f.key}
          className="adm-toolbar__filter"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
