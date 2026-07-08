import "./index.scss";

const PageHeader = ({ kicker, title, subtitle, actions }) => (
  <header className={`slr-page-header${actions ? " slr-page-header--with-actions" : ""}`}>
    <div>
      {kicker && <span className="slr-page-header__kicker">{kicker}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="slr-page-header__actions">{actions}</div>}
  </header>
);

export default PageHeader;
