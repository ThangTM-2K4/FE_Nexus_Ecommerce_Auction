import "./index.scss";

const StaffPageHeader = ({ kicker, title, subtitle }) => (
  <header className="stf-page-header">
    {kicker && <span className="stf-page-header__kicker">{kicker}</span>}
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
  </header>
);

export default StaffPageHeader;
