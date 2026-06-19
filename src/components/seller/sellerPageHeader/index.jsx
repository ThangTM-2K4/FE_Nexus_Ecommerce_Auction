import "./index.scss";

const PageHeader = ({ kicker, title, subtitle }) => (
  <header className="slr-page-header">
    {kicker && <span className="slr-page-header__kicker">{kicker}</span>}
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
  </header>
);

export default PageHeader;
