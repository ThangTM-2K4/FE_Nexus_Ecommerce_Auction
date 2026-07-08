import "./index.scss";

const AdminPageHeader = ({ kicker, title, subtitle }) => (
  <header className="adm-page-header">
    {kicker && <span className="adm-page-header__kicker">{kicker}</span>}
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
  </header>
);

export default AdminPageHeader;
