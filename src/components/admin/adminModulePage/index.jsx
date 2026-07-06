import AdminPageHeader from "../adminPageHeader";
import "./index.scss";

const AdminModulePage = ({
  kicker,
  title,
  subtitle,
  features = [],
  infoFields = [],
  actions = [],
}) => (
  <div className="adm-module">
    <AdminPageHeader kicker={kicker} title={title} subtitle={subtitle} />

    <div className="adm-module__grid">
      {actions.length > 0 && (
        <section className="adm-module__card">
          <h3>Chức năng</h3>
          <ul className="adm-module__list">
            {actions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {infoFields.length > 0 && (
        <section className="adm-module__card">
          <h3>Thông tin hiển thị</h3>
          <ul className="adm-module__list">
            {infoFields.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {features.length > 0 && (
        <section className="adm-module__card adm-module__card--wide">
          <h3>Chi tiết module</h3>
          <ul className="adm-module__list adm-module__list--cols">
            {features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>

    <div className="adm-module__notice">
      <p>Trang đang dùng dữ liệu mock. Sẽ kết nối API backend sau.</p>
    </div>
  </div>
);

export default AdminModulePage;
