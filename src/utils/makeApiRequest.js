import axios from "axios";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to prevent rapid-fire function calls
export const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Main function that handles all our API calls
const makeApiRequest = async (url, options, header, dispatch, token = null) => {
  const { method, data, params } = options;
  const lowerCaseMethod = method.toLowerCase();

  // Set up headers with auth token if we have one
  const headers = {
    ...(header && header !== "multipart/form-data" && { "Content-Type": header }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const finalUrl = url;

  try {
    if (dispatch) {
      dispatch({ type: "auth/loadingStart" });
    }

    // Special handling for file uploads - let axios handle the boundary
    if (header === "multipart/form-data") {
      const requestHeaders = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Temporarily remove Content-Type so axios can set it properly with boundary
      const originalCT = axiosInstance.defaults.headers["Content-Type"];
      delete axiosInstance.defaults.headers["Content-Type"];

      const response = await axiosInstance({
        method: lowerCaseMethod,
        url: finalUrl,
        data,
        ...(params && { params }),
        headers: requestHeaders,
      });

      // Put back the original Content-Type
      if (originalCT) axiosInstance.defaults.headers["Content-Type"] = originalCT;

      // Handle 204 No Content - return success object
      if (response.status === 204) {
        return { success: true, message: 'Operation completed successfully' };
      }

      return response.data;
    }

    // Handle blob responses (file downloads)
    if (options.responseType === 'blob') {
      const response = await axiosInstance({
        method: lowerCaseMethod,
        url: finalUrl,
        ...(data && { data }),
        ...(params && { params }),
        headers,
        responseType: 'blob',
      });

      // Create download link and trigger download
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'File downloaded successfully' };
    }

    // Regular API call for everything else
    const response = await axiosInstance({
      method: lowerCaseMethod,
      url: finalUrl,
      ...(data && { data }),
      ...(params && { params }),
      headers,
    });

    // Handle 204 No Content - return success object
    if (response.status === 204) {
      return { success: true, message: 'Operation completed successfully' };
    }

    return response.data;
  } catch (error) {
    const status = error?.response?.status;


    // Too many requests? Show a friendly message
    if (status === 429) {
      showOverlay(
        "Too Many Requests",
        "You have made too many requests. Please try again."
      );
      return;
    }

    // Session expired? Time to log in again
    if (status === 401) {
      showOverlay(
        "Session Expired",
        "Your session has expired. Please log in again.",
        () => {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "/login";
        }
      );
      return;
    }

    // Return user-friendly error message for all API errors
    if (error.response?.data) {
      // Preserve the original error message if it exists, otherwise use generic message
      const originalMessage = error.response.data.message || error.response.data.error;
      return {
        ...error.response.data,
        message: originalMessage || "Something went wrong. Please contact support."
      };
    }

    return {
      success: false,
      statusCode: status || 500,
      message: "Something went wrong. Please contact support.",
      data: null,
    };
  } finally {
    if (dispatch) {
      dispatch({ type: "auth/loadingEnd" });
    }
  }
};

// Creates a nice modal overlay to show important messages
function showOverlay(title, message, callback) {
  // Don't create duplicate overlays
  if (document.getElementById("session-expired-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "session-expired-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;

  modal.innerHTML = `
    <div style="color: #ff4d4f; font-size: 48px; margin-bottom: 20px;">
      <i class="bx bx-error-circle"></i>
    </div>
    <h3 style="margin-bottom: 15px;">${title}</h3>
    <p style="margin-bottom: 25px;">${message}</p>
    <button id="session-expired-btn" style="
      background: #ff4d4f;
      color: white;
      border: none;
      padding: 10px 30px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    ">OK</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById("session-expired-btn").onclick = () => {
    overlay.remove();
    if (callback) callback();
  };
}

export default makeApiRequest;





// import axios from "axios";
// import { logout } from "../store/reducers/authSlice";

// const baseurl = import.meta.env.VITE_APP_REACT_APP_BASE_URL;

// const axiosInstance = axios.create({

//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const debounce = (func, wait) => {
//   let timeout;
//   return function (...args) {
//     const context = this;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), wait);
//   }
// };

// const makeApiRequest = async (url, options, header, dispatch, token = null, tenantId = null) => {
//   const localData = localStorage?.getItem("token");
//   const { method, data } = options;
//   const lowerCaseMethod = method.toLowerCase();

//   const headers = {
//     "Content-Type": header ? header : "application/json",
//     ...(token && { Authorization: `Bearer ${token}` }),
//   };

//   const finalUrl = url;

//   try {
//     dispatch({ type: "auth/loadingStart" }); // Dispatch global loading start

//     // Special handling for multipart/form-data
//     if (header === 'multipart/form-data') {
//       // Don't set Content-Type, let axios handle it with boundary
//       delete headers['Content-Type'];

//       // Temporarily remove instance default Content-Type
//       const originalContentType = axiosInstance.defaults.headers['Content-Type'];
//       delete axiosInstance.defaults.headers['Content-Type'];

//       const response = await axiosInstance({
//         method: lowerCaseMethod,
//         url: finalUrl,
//         ...(data && { data }),
//         headers,
//       });

//       // Restore instance default
//       if (originalContentType) {
//         axiosInstance.defaults.headers['Content-Type'] = originalContentType;
//       }

//       return response.data;
//     }

//     // Normal request
//     const response = await axiosInstance({
//       method: lowerCaseMethod,
//       url: finalUrl,
//       ...(data && { data }),
//       headers,
//     });
//     return response.data;
//   } catch (error) {
//     const status = error?.response?.status;

//     // Handle 429 - Too Many Requests
//     if (status === 429) {
//       // Create blocking overlay
//       const overlay = document.createElement('div');
//       overlay.id = 'session-expired-overlay';
//       overlay.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: rgba(0, 0, 0, 0.7);
//         z-index: 99999;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//       `;

//       const modal = document.createElement('div');
//       modal.style.cssText = `
//         background: white;
//         padding: 30px;
//         border-radius: 8px;
//         max-width: 400px;
//         text-align: center;
//         box-shadow: 0 4px 20px rgba(0,0,0,0.3);
//       `;

//       modal.innerHTML = `
//         <div style="color: #ff9800; font-size: 48px; margin-bottom: 20px;">
//           <i class="bx bx-error-circle"></i>
//         </div>
//         <h3 style="margin-bottom: 15px; color: #333;">Too Many Requests</h3>
//         <p style="color: #666; margin-bottom: 25px;">You have made too many requests in a short period. Please log in again.</p>
//         <button id="session-expired-btn" style="
//           background: #ff4d4f;
//           color: white;
//           border: none;
//           padding: 10px 30px;
//           border-radius: 4px;
//           cursor: pointer;
//           font-size: 16px;
//         ">OK</button>
//       `;

//       overlay.appendChild(modal);
//       document.body.appendChild(overlay);

//       // Handle button click
//       document.getElementById('session-expired-btn').onclick = () => {
//         dispatch(logout());
//         sessionStorage.clear();
//         localStorage.clear();
//         window.location.href = "/login";
//       };

//       return;
//     }

//     //Handle 401 - Unauthorized / Token expired
//     if (status === 401) {
//       // Create blocking overlay
//       const overlay = document.createElement('div');
//       overlay.id = 'session-expired-overlay';
//       overlay.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: rgba(0, 0, 0, 0.7);
//         z-index: 99999;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//       `;

//       const modal = document.createElement('div');
//       modal.style.cssText = `
//         background: white;
//         padding: 30px;
//         border-radius: 8px;
//         max-width: 400px;
//         text-align: center;
//         box-shadow: 0 4px 20px rgba(0,0,0,0.3);
//       `;

//       modal.innerHTML = `
//         <div style="color: #ff4d4f; font-size: 48px; margin-bottom: 20px;">
//           <i class="bx bx-error-circle"></i>
//         </div>
//         <h3 style="margin-bottom: 15px; color: #333;">Session Expired</h3>
//         <p style="color: #666; margin-bottom: 25px;">Your session has expired. Please log in again.</p>
//         <button id="session-expired-btn" style="
//           background: #ff4d4f;
//           color: white;
//           border: none;
//           padding: 10px 30px;
//           border-radius: 4px;
//           cursor: pointer;
//           font-size: 16px;
//         ">Login Again</button>
//       `;

//       overlay.appendChild(modal);
//       document.body.appendChild(overlay);

//       // Handle button click
//       document.getElementById('session-expired-btn').onclick = () => {
//         dispatch(logout());
//         sessionStorage.clear();
//         localStorage.clear();
//         window.location.href = "/login";
//       };

//       return;
//     }

//     //Return normal structured error if not handled above
//     if (error.response && error.response.data) {
//       return error.response.data;
//     }

//     return {
//       success: false,
//       statusCode: status || 500,
//       message: error.message || "An unexpected error occurred",
//       data: null,
//     };
//   } finally {
//     dispatch({ type: "auth/loadingEnd" }); // Dispatch global loading end
//   }
// };

// export default makeApiRequest;
