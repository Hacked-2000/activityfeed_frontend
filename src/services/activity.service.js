import makeApiRequest from "../utils/makeApiRequest";
import { apiUrls } from "../utils/apiEndpoints";

export const createActivity = async (data, dispatch) => {
  const options = { method: "POST", data };
  return await makeApiRequest(apiUrls.CreateActivity, options, null, dispatch);
};

export const getActivities = async (tenantId, params, dispatch) => {
  const options = { method: "GET", params };
  return await makeApiRequest(apiUrls.GetActivities(tenantId), options, null, dispatch);
};
