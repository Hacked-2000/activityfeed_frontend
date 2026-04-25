export const validateActivityForm = (data) => {
  const errors = {};

  if (!data.tenantId?.trim()) errors.tenantId = "Tenant ID is required";
  if (!data.actorId?.trim()) errors.actorId = "Actor ID is required";
  if (!data.actorName?.trim()) errors.actorName = "Actor name is required";
  if (!data.type) errors.type = "Activity type is required";
  if (!data.entityId?.trim()) errors.entityId = "Entity ID is required";

  return errors;
};

export const isFormValid = (errors) => Object.keys(errors).length === 0;
