import { toast } from 'react-fox-toast';

// Toast configuration
const toastConfig = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Success toast
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...toastConfig,
    ...options,
  });
};

// Error toast
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...toastConfig,
    ...options,
  });
};

// Warning toast
export const showWarning = (message, options = {}) => {
  return toast.warning(message, {
    ...toastConfig,
    ...options,
  });
};

// Info toast
export const showInfo = (message, options = {}) => {
  return toast.info(message, {
    ...toastConfig,
    ...options,
  });
};

// Loading toast (simulate with info toast)
export const showLoading = (message = 'Loading...', options = {}) => {
  return toast.info(message, {
    ...toastConfig,
    autoClose: 5000, // Auto close after 5 seconds as fallback
    className: 'custom-toast-loading',
    ...options,
  });
};

// Update toast (just show new toast, can't actually update with react-fox-toast)
export const updateToast = (toastId, message, type = 'success', options = {}) => {
  // Since we can't dismiss or update, just show the new toast
  switch (type) {
    case 'success':
      return showSuccess(message, options);
    case 'error':
      return showError(message, options);
    case 'warning':
      return showWarning(message, options);
    case 'info':
      return showInfo(message, options);
    default:
      return toast(message, { ...toastConfig, ...options });
  }
};

// Custom toast with custom styling
export const showCustom = (message, type = 'default', options = {}) => {
  const customOptions = {
    ...toastConfig,
    className: `custom-toast-${type}`,
    ...options,
  };

  switch (type) {
    case 'success':
      return showSuccess(message, customOptions);
    case 'error':
      return showError(message, customOptions);
    case 'warning':
      return showWarning(message, customOptions);
    case 'info':
      return showInfo(message, customOptions);
    default:
      return toast(message, customOptions);
  }
};

// Simple toast (fallback)
export const showToast = (message, options = {}) => {
  return toast(message, { ...toastConfig, ...options });
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  custom: showCustom,
  loading: showLoading,
  update: updateToast,
  toast: showToast,
};