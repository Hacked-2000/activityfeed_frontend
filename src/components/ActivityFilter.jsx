const TYPES = [
  "all", "created", "updated", "deleted", "commented",
  "assigned", "status_changed", "uploaded", "exported",
];

const ActivityFilter = ({ active, onChange }) => {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
      {TYPES.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="btn"
          style={{
            padding: "5px 14px",
            fontSize: "13px",
            background: active === t ? "var(--primary)" : "var(--white)",
            color: active === t ? "var(--white)" : "var(--text-muted)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
          }}
        >
          {t === "all" ? "All" : t.replace("_", " ")}
        </button>
      ))}
    </div>
  );
};

export default ActivityFilter;
