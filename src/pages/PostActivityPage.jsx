import { useState, useCallback } from "react";
import { createActivity } from "../services/activity.service";
import { validateActivityForm, isFormValid } from "../utils/validation";
import { showSuccess, showError } from "../utils/toast";
import ActivityItem from "../components/ActivityItem";

const ACTIVITY_TYPES = [
  "created", "updated", "deleted", "commented",
  "assigned", "status_changed", "uploaded", "exported",
];

const defaultForm = {
  tenantId: "tenant_001",
  actorId: "",
  actorName: "",
  type: "",
  entityId: "",
};

const PostActivityPage = () => {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // optimistic list — items appear instantly, removed on failure (rollback)
  const [optimisticList, setOptimisticList] = useState([]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const validationErrors = validateActivityForm(form);
    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    const tempId = `temp_${Date.now()}`;

    // step 1 — show the item immediately before the API responds
    const optimisticItem = {
      ...form,
      _id: tempId,
      createdAt: new Date().toISOString(),
      metadata: {},
      _pending: true,
    };
    setOptimisticList((prev) => [optimisticItem, ...prev]);
    setSubmitting(true);

    const res = await createActivity(form, null);
    setSubmitting(false);

    if (res?.success) {
      // step 2a — confirm: drop the pending flag
      setOptimisticList((prev) =>
        prev.map((item) =>
          item._id === tempId ? { ...item, _pending: false } : item
        )
      );
      showSuccess("Activity queued");
      setForm(defaultForm);
      setErrors({});
    } else {
      // step 2b — rollback: remove the temp item entirely
      // this is the rollback — the item never made it to the server
      setOptimisticList((prev) => prev.filter((item) => item._id !== tempId));
      showError(res?.message || "Failed — activity rolled back");
    }
  }, [form]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Post Activity</h1>
          <p className="page-subtitle">Queue a new activity event</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>

        <div className="card" style={{ flex: "0 0 460px" }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tenant ID</label>
              <input
                className={`form-input ${errors.tenantId ? "error" : ""}`}
                name="tenantId"
                value={form.tenantId}
                onChange={handleChange}
                placeholder="e.g. tenant_001"
              />
              {errors.tenantId && <span className="form-error">{errors.tenantId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Actor ID</label>
              <input
                className={`form-input ${errors.actorId ? "error" : ""}`}
                name="actorId"
                value={form.actorId}
                onChange={handleChange}
                placeholder="e.g. user_123"
              />
              {errors.actorId && <span className="form-error">{errors.actorId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Actor Name</label>
              <input
                className={`form-input ${errors.actorName ? "error" : ""}`}
                name="actorName"
                value={form.actorName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
              />
              {errors.actorName && <span className="form-error">{errors.actorName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Activity Type</label>
              <select
                className={`form-input ${errors.type ? "error" : ""}`}
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
              {errors.type && <span className="form-error">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Entity ID</label>
              <input
                className={`form-input ${errors.entityId ? "error" : ""}`}
                name="entityId"
                value={form.entityId}
                onChange={handleChange}
                placeholder="e.g. doc_456"
              />
              {errors.entityId && <span className="form-error">{errors.entityId}</span>}
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {submitting ? "Posting..." : "Post Activity"}
            </button>
          </form>
        </div>

        {/* optimistic preview — items appear here instantly, fade out on rollback */}
        {optimisticList.length > 0 && (
          <div style={{ flex: 1, minWidth: 300 }}>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
              Recent submissions
            </p>
            <div className="feed-container">
              {optimisticList.map((item) => (
                <div
                  key={item._id}
                  style={{
                    opacity: item._pending ? 0.45 : 1,
                    transition: "opacity 0.3s ease",
                    position: "relative",
                  }}
                >
                  <ActivityItem activity={item} />
                  {item._pending && (
                    <span style={{
                      position: "absolute",
                      top: 12,
                      right: 14,
                      fontSize: "11px",
                      color: "var(--text-muted)",
                    }}>
                      sending...
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostActivityPage;
