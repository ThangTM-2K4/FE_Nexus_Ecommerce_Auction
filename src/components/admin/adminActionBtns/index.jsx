const ActionBtns = ({ actions }) => (
  <div className="adm-actions">
    {actions.map((a) => (
      <button
        key={a.label}
        type="button"
        className={a.variant || ""}
        onClick={(e) => {
          e.stopPropagation();
          a.onClick();
        }}
      >
        {a.label}
      </button>
    ))}
  </div>
);

export default ActionBtns;
