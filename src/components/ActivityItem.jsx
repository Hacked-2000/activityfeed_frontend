const typeLabels = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  commented: "Commented",
  assigned: "Assigned",
  status_changed: "Status Changed",
  uploaded: "Uploaded",
  exported: "Exported",
};

const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const ActivityItem = ({ activity }) => {
  const { actorName, type, entityId, createdAt } = activity;

  return (
    <div className="activity-item">
      <div className="activity-avatar">{getInitials(actorName)}</div>
      <div className="activity-body">
        <span className="activity-actor">{actorName}</span>
        <p className="activity-desc">
          {typeLabels[type] || type} on entity <strong>{entityId}</strong>
        </p>
        <div className="activity-meta">
          <span className="activity-time">{timeAgo(createdAt)}</span>
          <span className={`activity-badge badge-${type}`}>{typeLabels[type] || type}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
