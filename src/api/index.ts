import { data } from "autoprefixer";
import { getItemInLocalStorage } from "../utils/localStorage";
import axiosInstance from "./axiosInstance";
import HrmsAuth from "./HrmsAuth";
import vibeAuth from "./vibeAuth";
import axios from "axios";
// import DigestFetch from "digest-fetch";
export const API_URL = "https://admin.vibecopilot.ai";
export const vibeMedia = "https://admin.vibecopilot.ai/api/media/";
export const hrmsDomain = "https://api.hrms.vibecopilot.ai/";
import DigestFetch from "digest-fetch";
// import DigestAuth from "@mhoc/axios-digest-auth";
import AxiosDigestAuth from "@mhoc/axios-digest-auth";
// export const hrmsDomain = "http://13.126.205.205";
const token = getItemInLocalStorage("TOKEN");
export const domainPrefix = "https://admin.vibecopilot.ai";
// export const domainPrefix = "http://localhost:3000";

// export const domainPrefix = "http://13.215.74.38";
export const login = async (data) => axiosInstance.post("/login.json", data);

export const getLogin = async () => axiosInstance.get("/login.json");
export const vibeBGImages = async () => axiosInstance.get("/api/employee/get_bg_image.json")
// dashboard
export const getTicketDashboard = async () =>
  axiosInstance.get("/pms/admin/complaints/complaints_dashboard.json", {
    params: {
      token: token,
    },
  });
//Assets
export const getPerPageSiteAsset = async (page, perPage) =>
  axiosInstance.get(`/site_assets.json?per_page=${perPage}&page=${page}`, {
    params: {
      token: token,
    },
  });
export const downloadQrCode = async (ids) =>
  axiosInstance.get(`/site_assets/print_qr_codes?asset_ids=${ids}`, {
    responseType: "blob",
    params: {
      token: token,
    },
  });

export const softServiceDownloadQrCode = async (ids) =>
  axiosInstance.get(`/soft_services/print_qr_codes?soft_service_ids=${ids}`, {
    responseType: "blob",
    params: {
      token: token,
    },
  });

export const getSiteAsset = async (page) =>
  axiosInstance.get(`/site_assets.json`, {
    params: {
      token: token,
    },
  });

export const getMeteredSiteAsset = async () =>
  axiosInstance.get(`/site_assets.json?q[is_meter]=true`, {
    params: {
      token: token,
    },
  });
export const getSiteSearchedAsset = async (searchValue) =>
  axiosInstance.get(
    `/site_assets.json?q[oem_name_or_name_or_building_name_or_unit_name_cont]=${searchValue}`,
    // `/site_assets.json?q[oem_name_cont]=${oem}&q[name_cont]=${assetName}&q[building_name_cont]=${building}&q[unit_name_cont]=${unit}`,
    {
      params: {
        token: token,
      },
    }
  );
export const getSiteAssetDetails = async (id) =>
  axiosInstance.get(`/site_assets/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postSiteAsset = async (data) =>
  axiosInstance.post(`/site_assets.json`, data, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const EditSiteAsset = async (data, id) =>
  axiosInstance.put(`/site_assets/${id}.json`, data, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// other bills
export const postOtherBills = async (data) =>
  axiosInstance.post("/other_bills.json", data, {
    params: {
      token: token,
    },
  });
export const getOtherBills = async () =>
  axiosInstance.get("/other_bills.json", {
    params: {
      token: token,
    },
  });
export const getOtherBillsDetails = async (id) =>
  axiosInstance.get(`/other_bills/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editOtherBillsDetails = async (id, data) =>
  axiosInstance.put(`/other_bills/${id}.json`, data, {
    params: {
      token: token,
    },
  });
//polls
export const postPolls = async (data) =>
  axiosInstance.post("/polls.json", data, {
    params: {
      token: token,
    },
  });
export const postPollVote = async (id, data) =>
  axiosInstance.post(`/polls/${id}/poll_votes.json`, data, {
    params: {
      token: token,
    },
  });
export const getPolls = async () =>
  axiosInstance.get("/polls.json", {
    params: {
      token: token,
    },
  });

// vendor
export const getVendors = async () =>
  axiosInstance.get("/vendors.json", {
    params: {
      token: token,
    },
  });

export const getVendorById= async (id) =>
  axiosInstance.get("/vendors.json", {
    params: {
      token: token,
      "q[id_eq]":id,
    },
  });
export const getVendorCategory = async () =>
  axiosInstance.get("/vendor_categories.json", {
    params: {
      token: token,
    },
  });
export const getVendorCategoryDetails = async (id) =>
  axiosInstance.get(`/vendor_categories/${id}.json`, {
    params: {
      token: token,
    },
  });
export const deleteVendorCategory = async (id) =>
  axiosInstance.delete(`/vendor_categories/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postVendorCategory = async (data) =>
  axiosInstance.post("/vendor_categories.json", data, {
    params: {
      token: token,
    },
  });
export const postVendorType = async (data) =>
  axiosInstance.post("/vendor_suppliers.json", data, {
    params: {
      token: token,
    },
  });
export const editVendorTypeDetails = async (id, data) =>
  axiosInstance.put(`/vendor_suppliers/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getVendorsType = async () =>
  axiosInstance.get("/vendor_suppliers.json", {
    params: {
      token: token,
    },
  });
export const getVendorsTypeDetails = async (id) =>
  axiosInstance.get(`/vendor_suppliers/${id}.json`, {
    params: {
      token: token,
    },
  });

export const editVendorType = async (id, data) =>
  axiosInstance.patch(`/vendor_suppliers/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const editVendorCategory = async (id, data) =>
  axiosInstance.patch(`/vendor_categories/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const getVendorsDetails = async (id) =>
  axiosInstance.get(`/vendors/${id}.json`, {
    params: {
      token: token,
    },
  });
export const deleteVendorType = async (id) =>
  axiosInstance.delete(`/vendor_suppliers/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postVendors = async (data) =>
  axiosInstance.post("/vendors.json", data, {
    params: {
      token: token,
    },
  });
export const EditVendors = async (id, data) =>
  axiosInstance.put(`/vendors/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const removeVendor = async (forumId) => {
  axiosInstance.delete(`/vendors/${forumId}.json/`, {
    params: {
      token: token,
    },
  });
};

//
export const getComplaints = async () =>
  axiosInstance.get(`/pms/complaints.json`, {
    params: {
      token: token,
    },
  });
export const getHelpDeskCategoriesSetup = async () =>
  axiosInstance.get(`/pms/admin/helpdesk_categories.json`, {
    params: {
      token: token,
    },
  });


//FitOut Checklist
export const postFitoutChecklist = async (data) =>
  axiosInstance.post(`/snag_checklists.json`, data, {
    params: {
      token: token,
    },
  });

export const getFitoutChecklist = async () =>
  axiosInstance.get(`/snag_checklists.json`, {
    params: {
      token: token,
    },
  });

//FitOut Request
export const postFitoutRequest = async (data) =>
  axiosInstance.post(`/fitout_request.json`, data, {
    params: {
      token: token,
    },
  });
export const getFitoutRequest = async (page, per_page) =>
  axiosInstance.get(`/fitout_request.json`, {
    params: {
      token: token,
      per_page: per_page,
      page: page,
    },
  });

export const getFitoutRequestById = async (id) =>
  axiosInstance.get(`/fitout_request/${id}.json`, {
    params: {
      token: getToken(),
    },
  });

export const updateStatusFitoutRequest = async (id, data) =>
  axiosInstance.put(`/fitout_request/${id}.json`, data, {
    params: {
      token: getToken(),
    },
  });

export const getFitOutCategoriesSetup = async () =>
  axiosInstance.get(`/fit_out_setup_categories.json`, {
    params: {
      token: token,
    },
  });

export const postFitoutDocsUpload = async (data) =>
  axiosInstance.post(`/fitout_documents.json`, data, {
    params: {
      token: token,
    },
  });

export const getFitoutDocs = async () =>
  axiosInstance.get(`/fitout_documents.json`, {
    params: {
      token: token,
    },
  });  
export const getFitoutCategoriesSetupDetails = async (id) =>
  axiosInstance.get(`/fit_out_setup_categories/${id}.json`, {
    params: {
      token: token,
    },
  });

 export const postFitoutCategoriesSetup = async (data) =>
  axiosInstance.post(`/fit_out_setup_categories.json`, data, {
    params: {
      token: token,
    },
  });

export const putFitoutCategoriesSetup = async (catId, data) =>
  axiosInstance.put(`/fit_out_setup_categories/${catId}.json`, data, {
    params: {
      token: token,
    },
  });

export const destroyFitoutCategory = async (catId) =>
  axiosInstance.delete(`/fit_out_setup_categories/${catId}.json`, {
    params: {
      token: token,
    },
  });
  
 export const postFitOutSubCategoriesSetup = async (data) =>
  axiosInstance.post(`/fitout_subcategories.json`, data, {
    params: {
      token: token,
    },
  });
  
  export const getFitoutSubCategoriesSetupDetails = async (id) =>
  axiosInstance.get(`/fitout_subcategories/${id}.json`, {
    params: {
      token: token,
    },
  });

  export const getFitoutStatusSetup = async () =>
  axiosInstance.get(`/fitout_statuses.json`, {
    params: {
      token: getToken(),
    },
  });
  export const getFitOutStatus = async (id) =>
  axiosInstance.get(`/fitout_statuses/${id}.json`, {
    params: {
      token: token,
    },
  });

export const editFitOutStatus = async (id, data) =>
  axiosInstance.put(`/fitout_statuses/${id}.json`, data, {
    params: {
      token: token,
    },
  });
  export const postFitOutStatus = async (data) =>
  axiosInstance.post(`/fitout_statuses.json`, data, {
    params: {
      token: token,
    },
  });
  export const getFitoutSubCategoriesSetup = async () =>
  axiosInstance.get(`/fitout_subcategories.json`, {
    params: {
      token: token,
    },
  });
  export const getAllVendors = async () =>
  axiosInstance.get("/vendors/all_vendors.json", {
    params: {
      token: token,
    },
  });

  export const postSnagAnswer = async (data) =>
  axiosInstance.post(`/snag_answers.json`, data, {
    params: {
      token: getToken(),
    },
  });

export const getSnagAnswer = async (data) =>
  axiosInstance.get(`/snag_answers.json`, data, {
    params: {
      token: token,
    },
  });
  export const getSnagChecklistByCategory = async (categoryId) => {
  return axiosInstance.get("/snag_checklists.json", {
    params: {
      token: getToken(),
      "q[snag_audit_category_id_eq]": categoryId,
    },
  });
};
export const getSnagAnswersByResource = async (categoryTypeId) => {
  return axiosInstance.get("/snag_answers.json", {
    params: {
      token: token,
      "q[resource_id_eq]": categoryTypeId,
    },
  });
};
export const getSnagChecklistID = async (data) =>
  axiosInstance.post(`/snag_checklists.json`, data, {
    params: {
      token: getToken(),
    },
  });
// ticket download section
export const getTicketStatusDownload = async () =>
  axiosInstance.get(`/pms/admin/complaints/export_complaints.xlsx?`, {
    params: {
      token: token,
    },
    responseType: "blob",
  });

export const getStatusDownload = async (id) =>
  axiosInstance.get(`/pms/admin/complaints/export_complaints.xlsx`, {
    params: {
      token: token,
      "q[complaint_status_name_eq]": id,
    },
    responseType: "blob",
  });

// soft Service
export const getSoftServiceDownload = async () =>
  axiosInstance.get(`/soft_services/export_soft_service.xlsx?`, {
    params: {
      token: token,
    },
    responseType: "blob",
  });

export const getHelpDeskCategoriesSetupDetails = async (id) =>
  axiosInstance.get(`/pms/admin/helpdesk_categories/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editHelpDeskCategoriesSetupDetails = async (id, data) =>
  axiosInstance.put(`/pms/admin/helpdesk_categories/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postHelpDeskCategoriesSetup = async (data) =>
  axiosInstance.post(`/pms/admin/helpdesk_categories.json`, data, {
    params: {
      token: token,
    },
  });
export const postHelpDeskSubCategoriesSetup = async (data) =>
  axiosInstance.post(`/pms/admin/create_helpdesk_sub_category.json`, data, {
    params: {
      token: token,
    },
  });
export const getHelpDeskEscalationSetup = async () =>
  axiosInstance.get(`/pms/admin/helpdesk_categories/complaint_workers.json`, {
    params: {
      token: token,
    },
  });
export const deleteEscalationRule = async (id) =>
  axiosInstance.delete(`/pms/admin/delete_complaint_worker/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postHelpDeskEscalationSetup = async (data) =>
  axiosInstance.post(`/pms/admin/create_complaint_worker.json`, data, {
    params: {
      token: token,
    },
  });
export const deleteHelpDeskCategorySetup = async (id, data) =>
  axiosInstance.patch(`/pms/admin/modify_helpdesk_category/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getGRN = async () =>
  axiosInstance.get(`/grn_details.json`, {
    params: {
      token: token,
    },
  });
export const getGRNById = async (id) =>
  axiosInstance.get(`/grn_details/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postHelpDeskResolutionEscalationSetup = async (data) =>
  axiosInstance.post(`/pms/admin/create_escalation.json`, data, {
    params: {
      token: token,
    },
  });
export const getHelpDeskSubCategoriesSetup = async () =>
  axiosInstance.get(`/pms/admin/get_sub_categories.json`, {
    params: {
      token: token,
    },
  });
export const getHelpDeskSubCategoriesSetupDetails = async (id) =>
  axiosInstance.get(`/pms/admin/get_sub_categories/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getHelpDeskStatusSetup = async () =>
  axiosInstance.get(`/pms/admin/helpdesk_categories/complaint_statuses.json`, {
    params: {
      token: token,
    },
  });
export const getHelpDeskStatusDetailsSetup = async (id) =>
  axiosInstance.get(
    `/pms/admin/helpdesk_categories/complaint_statuses/${id}.json`,
    {
      params: {
        token: token,
      },
    }
  );
export const editHelpDeskStatusDetailsSetup = async (id, data) =>
  axiosInstance.put(
    `/pms/admin/helpdesk_categories/complaint_statuses/${id}.json`,
    data,
    {
      params: {
        token: token,
      },
    }
  );
export const postHelpDeskStatusSetup = async (data) =>
  axiosInstance.post(`/pms/admin/create_complaint_statuses.json`, data, {
    params: {
      token: token,
    },
  });
export const getAdminComplaints = async () =>
  axiosInstance.get(`/pms/admin/complaints.json`, {
    params: {
      token: token,
    },
  });
export const getCARItems = async (ticketId) =>
  axiosInstance.get(
    `/ticket_items.json?items=true&q[ticket_id_eq]=${ticketId}`,
    {
      params: {
        token: token,
      },
    }
  );

// perPage

export const getAdminPerPageComplaints = async (page, perPage) =>
  axiosInstance.get(`/pms/admin/complaints.json`, {
    params: {
      token: token,
      per_page: perPage,
      page: page,
    },
  });

export const getComplaintsDetails = async (id) =>
  axiosInstance.get(`pms/complaints/${id}.json`, {
    params: {
      token: token,
    },
  });

export const fetchSubCategories = async (categoryId) =>
  axiosInstance.get(`/pms/admin/get_sub_categories.json`, {
    params: {
      token: token,
      category_type_id: categoryId,
    },
  });

export const fetchUserComplaints = async (data) =>
  axiosInstance.get(`complaints.json`, data, {
    params: {
      token: token,
    },
  });

//

export const getUnits = async (floor_id) =>
  axiosInstance.get(`/units.json?q[floor_id_eq]=${floor_id}`, {
    params: {
      token: token,
      // floor_id_eq: floor_id,
    },
  });

export const getFloors = async (buildId) =>
  axiosInstance.get(`/floors.json?q[building_id_eq]=${buildId}`, {
    params: {
      token: token,
    },
  });

export const updateComplaintsDetails = async (id, data) =>
  axiosInstance.put(`pms/complaints/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const getAssignedTo = async (data) =>
  axiosInstance.get(`/users/pms_admins.json`, {
    params: {
      token: token,
    },
  });

export const getFacilitySetup = async (data) =>
  axiosInstance.get(`/amenities.json`, data, {
    params: {
      token: token,
    },
  });

export const getFacitilitySetupId = async (id) =>
  axiosInstance.get(`/amenities/${id}.json`, {
    params: {
      token: token,
    },
  });

export const updateFacitilitySetup = async (data, id) =>
  axiosInstance.put(`/amenities/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const getIssueType = async () =>
  axiosInstance.get(`pms/admin/complaint_issue_types.json`, {
    params: {
      token: token,
    },
  });

export const getfloorsType = async (buildId) =>
  axiosInstance.get(`/floors.json`, {
    params: {
      token: token,
      building_id: buildId,
    },
  });

export const postComplaintsDetails = async (data) => {
  try {
    const response = await axiosInstance.post(
      `/pms/complaints.json?token=${token}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editComplaintsDetails = async (data) => {
  try {
    const response = await axiosInstance.post(
      `/complaint_logs.json?token=${token}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (data) =>
  axiosInstance.post("/users/change_password.json", data, {
    params: {
      token: token,
    },
  });

// export const editComplaintsDetails = async (compData) => {
//   axiosInstance.post (`/complaint_logs.json?token=${token}`,{
//     params : {
//       token : token,
//       complaint : compData
//     }
//   })
// }

export const getAssetGroups = async () =>
  axiosInstance.get("/asset_groups.json?q[group_for_eq]=asset", {
    params: {
      token: token,
    },
  });
export const getAssetGroupsDetails = async (id) =>
  axiosInstance.get(`/asset_groups/${id}.json?q[group_for_eq]=asset`, {
    params: {
      token: token,
    },
  });
export const editAssetGroupsDetails = async (id, data) =>
  axiosInstance.put(`/asset_groups/${id}.json?q[group_for_eq]=asset`, data, {
    params: {
      token: token,
    },
  });
export const getParentAsset = async (id) =>
  axiosInstance.get(
    `/site_assets.json?q[asset_type_eq]=parent&q[asset_group_id_eq]=${id}`,

    {
      params: {
        token: token,
      },
    }
  );

export const getAssetSubGroups = async (groupId) => {
  try {
    const response = await axiosInstance.get("/sub_groups.json", {
      params: {
        token: token,
        group_id: groupId,
      },
    });
    return response.data; // Return the data from the response
  } catch (error) {
    console.error("Error fetching asset subgroups:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const postAssetGroups = async (data) =>
  axiosInstance.post("/asset_groups.json", data, {
    params: {
      token: token,
    },
  });
export const postAssetSubGroups = async (data) =>
  axiosInstance.post("/sub_groups.json", data, {
    params: {
      token: token,
    },
  });

export const postAssetparams = async (data) =>
  axiosInstance.post("/asset_params.json", data, {
    params: {
      token: token,
    },
  });
export const getAssetparamsDetails = async (id) =>
  axiosInstance.get(`/asset_params/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editAssetparamsDetails = async (id, data) =>
  axiosInstance.put(`/asset_params/${id}.json`, data, {
    params: {
      token: token,
    },
  });

// asset checklist
// export const postChecklist = async (data) =>
//   axiosInstance.post("checklists.json", data, {
//     params: {
//       token: token,
//     },
//   });

// amc
export const getAMC = async () =>
  axiosInstance.get("/asset_amcs.json", {
    params: {
      token: token,
    },
  });
export const postAMC = async (data) =>
  axiosInstance.post("/asset_amcs.json", data, {
    params: {
      token: token,
    },
  });
export const getAMCDetails = async (assetId) =>
  axiosInstance.get(`/asset_amcs.json?q[asset_id_eq]=${assetId}`, {
    params: {
      token: token,
      // asset_id: assetId,
    },
  });
export const getEditAMCDetails = async (id) =>
  axiosInstance.get(`/asset_amcs/${id}.json`, {
    params: {
      token: token,
      // asset_id: assetId,
    },
  });

export const EditAMCDetails = async (data, id) =>
  axiosInstance.put(`/asset_amcs/${id}.json`, data, {
    params: {
      token: token,
      // asset_id: assetId,
    },
  });
export const getSubGroupsList = async () =>
  axiosInstance.get("/sub_groups.json", {
    params: {
      token: token,
    },
  });
export const getStockGroupsList = async () =>
  axiosInstance.get("/asset_groups.json?q[group_for_eq]=item", {
    params: {
      token: token,
    },
  });

export const postTicketAddItems = async (data) =>
  axiosInstance.post("/pms/admin/complaint_items.json", data, {
    params: {
      token: token,
    },
  });
// export const PostItemsApproval = async (data) =>
//   axiosInstance.post("/pms/admin/complaint_items.json", data, {
//     params: {
//       token: token,
//     },
//   });
export const getInventory = async () =>
  axiosInstance.get("/items.json", {
    params: {
      token: token,
    },
  });
export const postInventory = async (data) =>
  axiosInstance.post("/items.json", data, {
    params: {
      token: token,
    },
  });
export const editInventory = async (data, id) =>
  axiosInstance.put(`/items/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const getInventoryDetails = async (id) =>
  axiosInstance.get(`/items/${id}.json`, {
    params: {
      token: token,
    },
  });

export const getChecklist = async () =>
  axiosInstance.get("/checklists.json?q[ctype_eq]=routine", {
    params: {
      token: token,
    },
  });
export const getChecklistTemplate = async () =>
  axiosInstance.get("/checklists/download_template", {
    params: {
      token: token,
    },
  });
export const getMasterChecklist = async () =>
  axiosInstance.get("/checklists/get_master_checklist.json", {
    params: {
      token: token,
    },
  });
export const exportChecklist = async () =>
  axiosInstance.get("/export_checklist.xlsx", {
    params: {
      token: token,
    },
    responseType: "blob",
  });
export const downloadSampleChecklist = async () =>
  axiosInstance.get("/checklists/download_template", {
    params: {
      token: token,
    },
    responseType: "blob",
  });
export const getAssociationList = async (checklistId) =>
  axiosInstance.get(
    `/checklist_associations.json?checklist_id=${checklistId}`,
    {
      params: {
        token: token,
      },
    }
  );

export const getChecklistDetails = async (id) =>
  axiosInstance.get(`/checklists/${id}.json`, {
    params: {
      token: token,
    },
  });
export const ChecklistImport = async (file) =>
  axiosInstance.post(`/checklist/checklist_import.json`, file, {
    params: {
      token: token,
    },
  });
export const postAssetAssociation = async (data) =>
  axiosInstance.post(`/activities.json`, data, {
    params: {
      token: token,
    },
  });

export const deleteAssetAssociation = async ({ checklist_id, asset_id }) =>
  axiosInstance.delete("/activities/bulk_destroy.json", {
    params: {
      checklist_id,
      asset_id: asset_id,
      token: token,
    },
  });

export const deleteServiceAssociation = async ({
  checklist_id,
  soft_service_id,
}) =>
  axiosInstance.delete("/activities/bulk_destroy.json", {
    params: {
      checklist_id,
      soft_service_id: soft_service_id,
      token: token,
    },
  });

export const getFacitilitySetup = async () => {
  try {
    const response = await axiosInstance.get(`/amenities.json`, {
      params: {
        token: token,
      },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching facility setup:", error);
    throw error;
  }
};

export const getAmenitiesBooking = async () => {
  return axiosInstance.get(`/amenity_bookings.json`, {
    params: {
      token: token,
    },
    // headers: {
    //   "Cache-Control": "no-cache",
    //   Pragma: "no-cache", // Older HTTP/1.0 caches
    //   Expires: "0", // Immediately expires the cached response
    // },
  });
};

export const getAmenitiesBookingById = async (id) => {
  return axiosInstance.get(`/amenity_bookings.json/${id}`, {
    params: {
      token: token,
    },
  });
};

export const getFacilitySlots = async (facilityId, selectedDate) =>
  axiosInstance.get(`/slots/available.json`, {
    params: {
      token: token,
      amenity_id: facilityId,
      date: selectedDate,
    },
  });

export const postAmenitiesBooking = async (data) =>
  axiosInstance.post(`/amenity_bookings.json`, data, {
    params: {
      token: token,
    },
  });

export const updateActivity = async (id, data) =>
  axiosInstance.put(`/activities/bulk_update.json`, data, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

// export const getRoutineTask = async () =>
//   axiosInstance.get("/activities.json?q[checklist_ctype_eq]=routine", {
//     params: {
//       token: token,
//     },
//   });

// In your api file
// ...existing code...

// Update your API function to format dates properly
export const getRoutineTask = async (
  startDate = null,
  endDate = null,
  status = null
) => {
  const params = {
    token: token,
  };
  if (startDate) {
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    params["q[start_date_gteq]"] = formattedStartDate;
  }
  if (endDate) {
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0];
    params["q[start_date_lteq]"] = formattedEndDate;
  }
  if (status && status !== "all") {
    params["q[status_eq]"] = status;
  }

  return axiosInstance.get("/activities.json?q[checklist_ctype_eq]=routine", {
    params: params,
  });
};

export const getRoutineTaskStatus = async (
  status = null,
  startDate = null,
  endDate = null
) => {
  const token = localStorage.getItem("token");

  const params = {
    token,
  };

  if (status) {
    params["q[status_eq]"] = status;
  }

  if (startDate) {
    params["q[start_time_gteq]"] = startDate;
  }

  if (endDate) {
    params["q[start_time_lteq]"] = endDate;
  }

  const response = await axiosInstance.get(
    "/activities/routine_task_counts.json",
    { params }
  );

  return response.data;
};

// ...existing code...
export const getPPMTask = async () =>
  axiosInstance.get("/activities.json?q[checklist_ctype_eq]=ppm", {
    params: {
      token: token,
    },
  });
export const getRoutineTaskDetails = async (assetId, activityId) =>
  axiosInstance.get(
    `/submissions.json?q[checklist_id_is_not_null]=1&q[asset_id_eq]=${assetId}&q[activity_id_eq]=${activityId}`,
    {
      params: {
        token: token,
      },
    }
  );
export const getScheduleDetails = async (sId, activityId) =>
  axiosInstance.get(
    `/submissions.json?q[soft_service_id_eq]=${sId}&q[activity_id_eq]=${activityId}`,
    {
      params: {
        token: token,
      },
    }
  );

// export const getAssetPPMActivityDetails = async (assetId) =>
//   axiosInstance.get(
//     `/submissions.json?q[asset_id_eq]=${assetId}&q[checklist_ctype_eq]=ppm`,
//     {
//       params: {
//         token: token,
//       },
//     }
//   );
export const getAssetPPMs = async (assetId) =>
  axiosInstance.get(
    `/site_assets/${assetId}/asset_ppm_show.json?q[checklist_id_is_not_null]=1`,
    {
      params: {
        token: token,
      },
    }
  );

export const getSoftServiceStatus = async (data, startDate = null, endDate = null) => {
  let url = `/activities.json?q[soft_service_id_null]=0&q[status_eq]=${data}`;
  
  if (startDate) {
    url += `&q[start_time_gteq]=${startDate}`;
  }
  if (endDate) {
    url += `&q[start_time_lteq]=${endDate}`;
  }
  
  return axiosInstance.get(url, {
    params: {
      token: token,
    },
  });
};
export const getPPMCalendar = async (startdate, enddate) =>
  axiosInstance.get(
    `/activities/calendar_data.json&q[checklist_ctype_eq]=ppm?startdate=${startdate}&enddate=${enddate}`,
    {
      params: {
        token: token,
      },
    }
  );

export const postGRN = async (data) =>
  axiosInstance.post(`/grn_details.json`, data, {
    params: {
      token: token,
    },
  });
export const postMasters = async (data) =>
  axiosInstance.post(`/inventories.json`, data, {
    params: {
      token: token,
    },
  });
export const ImportMasters = async (file) =>
  axiosInstance.post(`/inventories/import.json`, file, {
    params: {
      token: token,
    },
  });
export const getMasters = async () =>
  axiosInstance.get("/inventories.json", {
    params: {
      token: token,
    },
  });
export const getMastersDetails = async (id) =>
  axiosInstance.get(`/inventories/${id}.json`, {
    params: {
      token: token,
    },
  });
export const UpdateMasters = async (data, id) =>
  axiosInstance.put(`/inventories/${id}.json`, data, {
    params: {
      token: token,
    },
  });
//booking & request
export const postFlightTicketRequest = async (data) =>
  axiosInstance.post(`/flight_requests.json`, data, {
    params: {
      token: token,
    },
  });
// ppm details/

export const getPPMDetails = async (assetId, activityId) =>
  axiosInstance.get(
    `/submissions.json?q[asset_id_eq]=${assetId}&q[activity_id_eq]=${activityId}`,
    {
      params: {
        token: token,
      },
    }
  );

//Field sense
export const postFieldSenseMeetingManagement = async (data) =>
  axiosInstance.post(`/field_sense_meeting_managements.json`, data, {
    params: {
      token: token,
    },
  });
export const getFieldSenseMeetingManagement = async () =>
  axiosInstance.get("/field_sense_meeting_managements.json", {
    params: {
      token: token,
    },
  });
export const getFieldSenseMeetingManagementDetails = async (id) =>
  axiosInstance.get(`/field_sense_meeting_managements/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postFieldSenseLeadManagement = async (data) =>
  axiosInstance.post(`/field_sense_leads_managements.json`, data, {
    params: {
      token: token,
    },
  });
export const getFieldSenseLeadManagement = async () =>
  axiosInstance.get("/field_sense_leads_managements.json", {
    params: {
      token: token,
    },
  });
export const getFieldSenseLeadManagementDetails = async (id) =>
  axiosInstance.get(`/field_sense_leads_managements/${id}.json`, {
    params: {
      token: token,
    },
  });
//Booking & Request
export const getHotelRequest = async () =>
  axiosInstance.get("/hotels.json", {
    params: {
      token: token,
    },
  });
export const getFilterHotelRequest = async (approve) =>
  axiosInstance.get(`/hotels.json?q[booking_status_eq]=${approve}`, {
    params: {
      token: token,
    },
  });
export const hotelApproval = async (approve, data) =>
  axiosInstance.patch(`/hotels/${approve}.json?`, data, {
    params: {
      token: token,
    },
  });
export const postHotelRequest = async (data) =>
  axiosInstance.post(`/hotels.json`, data, {
    params: {
      token: token,
    },
  });
export const getHotelRequestDetails = async (id) =>
  axiosInstance.get(`/hotels/${id}.json`, {
    params: {
      token: token,
    },
  });
export const UpdateHotelRequest = async (data, id) =>
  axiosInstance.put(`/hotels/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const UpdateFlightRequest = async (data, id) =>
  axiosInstance.put(`/flight_requests/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getFlightRequestDetails = async (id) =>
  axiosInstance.get(`/flight_requests/${id}.json`, {
    params: {
      token: token,
    },
  });

export const getFlightTicketRequest = async () =>
  axiosInstance.get("/flight_requests.json", {
    params: {
      token: token,
    },
  });
export const getFilterFlightTicketRequest = async (approve) =>
  axiosInstance.get(`/flight_requests.json?q[booking_status_eq]=${approve}`, {
    params: {
      token: token,
    },
  });
export const flightApproval = async (approve, data) =>
  axiosInstance.patch(`/flight_requests/${approve}.json?`, data, {
    params: {
      token: token,
    },
  });
export const UpdateCabRequest = async (data, id) =>
  axiosInstance.put(`/cab_and_bus_requests/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getCabRequestDetails = async (id) =>
  axiosInstance.get(`/cab_and_bus_requests/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getcabRequest = async () =>
  axiosInstance.get("/cab_and_bus_requests.json", {
    params: {
      token: token,
    },
  });
export const getFilterCabRequest = async (approve) =>
  axiosInstance.get(
    `/cab_and_bus_requests.json?q[booking_status_eq]=${approve}`,
    {
      params: {
        token: token,
      },
    }
  );
export const cabApproval = async (approve, data) =>
  axiosInstance.patch(`/cab_and_bus_requests/${approve}.json?`, data, {
    params: {
      token: token,
    },
  });
export const postCabRequest = async (data) =>
  axiosInstance.post(`/cab_and_bus_requests.json`, data, {
    params: {
      token: token,
    },
  });
export const UpdatetransportRequest = async (data, id) =>
  axiosInstance.put(`/transport_requests/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const gettransportRequestDetails = async (id) =>
  axiosInstance.get(`/transport_requests/${id}.json`, {
    params: {
      token: token,
    },
  });
export const gettransportRequest = async () =>
  axiosInstance.get("/transport_requests.json", {
    params: {
      token: token,
    },
  });
export const getFilterTransportRequest = async (approve) =>
  axiosInstance.get(
    `/transport_requests.json?q[booking_status_eq]=${approve}`,
    {
      params: {
        token: token,
      },
    }
  );
export const transportationApproval = async (approve, data) =>
  axiosInstance.patch(`/transport_requests/${approve}.json?`, data, {
    params: {
      token: token,
    },
  });
export const postTransportRequest = async (data) =>
  axiosInstance.post(`/transport_requests.json`, data, {
    params: {
      token: token,
    },
  });
export const getTravellingAllowanceRequest = async () =>
  axiosInstance.get("/transportation_allowance_requests.json", {
    params: {
      token: token,
    },
  });
export const postTravellingAllowanceRequest = async (data) =>
  axiosInstance.post(`/transportation_allowance_requests.json`, data, {
    params: {
      token: token,
    },
  });
export const UpdatetravellingallowanceRequest = async (data, id) =>
  axiosInstance.put(`/transportation_allowance_requests/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getTravellingAllowanceRequestDetails = async (id) =>
  axiosInstance.get(`/transportation_allowance_requests/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getFilterTravellingAllowanceRequest = async (approve) =>
  axiosInstance.get(
    `/transportation_allowance_requests.json?q[approval_status_eq]=${approve}`,
    {
      params: {
        token: token,
      },
    }
  );
export const travellingAllowanceApproval = async (approve, data) =>
  axiosInstance.patch(
    `/transportation_allowance_requests/${approve}.json?`,
    data,
    {
      params: {
        token: token,
      },
    }
  );
// ppm details
export const getAssetReadingDetails = async (assetId) =>
  axiosInstance.get(
    `/submissions.json?q[asset_id_eq]=${assetId}&q[asset_param_id_null]=0`,

    {
      params: {
        token: token,
      },
    }
  );
export const postBusinesscard = async (data) =>
  axiosInstance.post("/business_cards.json", data, {
    params: {
      token: token,
    },
  });
export const getBusinessCard = async () =>
  axiosInstance.get("/business_cards.json", {
    params: {
      token: token,
    },
  });
export const postHSNSetup = async (data) =>
  axiosInstance.post("/hsns.json", data, {
    params: {
      token: token,
    },
  });
export const getHSNSetup = async () =>
  axiosInstance.get("/hsns.json", {
    params: {
      token: token,
    },
  });
export const getHSNSetupDetails = async (id) =>
  axiosInstance.get(`/hsns/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postDailyPickUpTransportation = async (data) =>
  axiosInstance.post("/transportations.json", data, {
    params: {
      token: token,
    },
  });
export const getDailyPickUpTransportationDetails = async (id) =>
  axiosInstance.get(
    `/transportations/${id}.json`,

    {
      params: {
        token: token,
      },
    }
  );
export const editDailyPickUpTransportationDetails = async (id, data) =>
  axiosInstance.put(`/transportations/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getTransportation = async (transportationType) =>
  axiosInstance.get(
    `/transportations.json?q[transportation_type_eq]=${transportationType}`,
    {
      params: {
        token: token,
      },
    }
  );
export const getSetupUsers = async () =>
  axiosInstance.get("/users.json", {
    params: {
      token: token,
    },
  });
export const getHostList = async (siteId) =>
  axiosInstance.get(`/visitors/fetch_potential_hosts.json?site_id=${siteId}`, {
    params: {
      token: token,
    },
  });
export const getUserOtp = async (id) =>
  axiosInstance.get(`/visitors/get_visitor_by_id.json?id=${id}`, {
    // params: {
    //   token: token,
    // },
  });
export const postSetupUsers = async (data) =>
  axiosInstance.post("/users/create.json", data, {
    params: {
      token: token,
    },
  });
export const getVehicleParking = async () =>
  axiosInstance.get(`/parking_configurations.json`, {
    params: {
      token: token,
    },
  });
export const postVehicleParking = async (data) =>
  axiosInstance.post(`/parking_configurations.json`, data, {
    params: {
      token: token,
    },
  });
export const deleteVehicleParking = async (id) =>
  axiosInstance.delete(`/parking_configurations/${id}.json`, {
    params: {
      token: token,
    },
  });
export const deleteQuestionChecklist = async (id, qid) =>
  axiosInstance.delete(
    `/checklists/${id}/delete_question.json?question_id=${qid}`,
    {
      params: {
        token: token,
      },
    }
  );

export const getVehicleParkingDetails = async (id) =>
  axiosInstance.get(`/parking_configurations/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editVehicleParking = async (data, id) =>
  axiosInstance.patch(`/parking_configurations/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const postNewVisitor = async (data) =>
  axiosInstance.post("/visitors.json", data, {
    params: {
      token: token,
    },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

export const getPatrollings = async () =>
  axiosInstance.get("/patrollings.json", {
    params: {
      token: token,
    },
  });
export const getPatrollingDetails = async (id) =>
  axiosInstance.get(`/patrollings/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editPatrollingDetails = async (id, data) =>
  axiosInstance.put(`/patrollings/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postPatrolling = async (data) =>
  axiosInstance.post("/patrollings.json", data, {
    params: {
      token: token,
    },
  });
export const getGoods = async () =>
  axiosInstance.get("/goods_in_outs.json", {
    params: {
      token: token,
    },
  });
export const getGoodsDetails = async (id) =>
  axiosInstance.get(`/goods_in_outs/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postGoods = async (data) =>
  axiosInstance.post("/goods_in_outs.json", data, {
    params: {
      token: token,
    },
  });
export const getVisitorStaffCategory = async () =>
  axiosInstance.get("/visitor_staff_category.json", {
    params: {
      token: token,
    },
  });
export const postNewGoods = async (data) =>
  axiosInstance.post("/goods_in_outs.json", data, {
    params: {
      token: token,
    },
  });
export const getStaff = async () =>
  axiosInstance.get("/staffs.json", {
    params: {
      token: token,
    },
  });
export const getStaffDetails = async (id) =>
  axiosInstance.get(`/staffs/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editStaffDetails = async (id, data) =>
  axiosInstance.put(`/staffs/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postStaff = async (data) =>
  axiosInstance.post("/staffs.json", data, {
    params: {
      token: token,
    },
  });
export const postOTPVerification = async (data) =>
  axiosInstance.post("/visitors/verify_votp.json", data, {
    params: {
      token: token,
    },
  });
export const postVisitorCheckInCheckOut = async (visitorId, data) =>
  axiosInstance.post(
    `/visitors/${visitorId}/visitor_visits/check_visitor.json`,
    data,
    {
      params: {
        token: token,
      },
    }
  );

export const sendMailToUsers = async (userId) =>
  axiosInstance.get(`/users/send_welcome_email.json?id=${userId}`, {
    params: {
      token: token,
    },
  });
export const getAttendance = async (orgId, page) => {
  try {
    const response = await HrmsAuth.get(
      `/employees/attendance-bulk?organization_id=${orgId}`
      // `/employees/attendance-bulk?organization_id=${orgId}`
      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data/",
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance records:", error);
    throw error;
  }
};

// RMB Attendance
export const RmbAttendance = async (page = 1, perPage = 10) =>
  axiosInstance.get(`/event_users.json`, {
    params: {
      token: token,
      rmb: true,
      page: page,
      per_page: perPage,
    },
  });

// export const getClientAttendance = async(siteId, today)
// try {
//   const response = await HrmsAuth.
//     // get(`/employee/attendance/?employee_id=${empId}&start_date=${today}`);
//     get(`/employee/attendance/?employee_id=${siteId}&start_date=${today}`);
//   return response;
// } catch (error) {
//   console.error("Error getting employee attendance of today", error);
//   throw error;
// };

export const getEmployeeAttendance = async (userId) =>
  axiosInstance.get(`/attendances.json?q[attendance_of_id]=${userId}`, {
    params: {
      token: token,
    },
  });

// Events

// Check in Events
export const checkEventUser = async (id, mobile) => {
  return axiosInstance.post(`/events/${id}/check_otp.json`, { mobile });
};

// Verify Users
export const verifyOtpToCheckIn = async (id, otp, mobile) => {
  return axiosInstance.post(`/events/${id}/check_in.json`, {
    mobile,
    otp,
  });
};

export const getEvents = async () =>
  axiosInstance.get("/events.json", {
    params: {
      token: token,
    },
  });
export const getEventsDetails = async (id) =>
  axiosInstance.get(`/events/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editEventDetails = async (id, data) =>
  axiosInstance.put(`/events/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postEvents = async (data) =>
  axiosInstance.post("/events.json", data, {
    params: {
      token: token,
    },
  });
export const postGroups = async (data) =>
  axiosInstance.post("/groups.json", data, {
    params: {
      token: token,
    },
  });
export const getGroups = async () =>
  axiosInstance.get("/groups.json", {
    params: {
      token: token,
    },
  });

export const getGroupsDetails = async (id) => {
  return axiosInstance.get(`/groups/${id}.json?token=${token}`, {});
};

export const deleteGroup = async (id) =>
  axiosInstance.delete(`/groups/${id}.json`, {
    params: {
      token: token,
    },
  });

export const editGroups = async (id, data) => {
  // const token = getItemInLocalStorage("token"); // Ensure token retrieval is correct
  return axiosInstance.put(`/groups/${id}.json`, data, {
    params: {
      token: token,
    },
  });
};

export const postColorCode = async (data) =>
  axiosInstance.post(`/color_codes.json`, data, {
    params: {
      token: token,
    },
  });
export const getColorCode = async () =>
  axiosInstance.get(`/color_codes.json`, {
    params: {
      token: token,
    },
  });
export const editColorCode = async (id, data) =>
  axiosInstance.put(`/color_codes/${id}.json`, data, {
    params: {
      token: token,
    },
  });

//broadcast
export const getBroadCast = async () =>
  axiosInstance.get("/notices.json", {
    params: {
      token: token,
      // token: "775d6ae27272741669a65456ea10cc56cd4cce2bb99287b6",
    },
  });
export const postBroadCast = async (data) =>
  axiosInstance.post("/notices.json", data, {
    params: {
      token: token,
    },
  });

export const getBroadcastDetails = async (id) =>
  axiosInstance.get(`/notices/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editBroadcastDetails = async (id, data) =>
  axiosInstance.put(`/notices/${id}.json`, data, {
    params: {
      token: token,
    },
  });
//Permit
export const postNewPermit = async (data) =>
  axiosInstance.post("/permits.json", data, {
    params: {
      token: token,
    },
  });
export const postExtensionPermit = async (data) =>
  axiosInstance.post(`/permit_extensions.json`, data, {
    params: {
      token: token,
    },
  });
// export const postExtensionPermit = async (data) =>
//   axiosInstance.post("/extensions.json", data, {
//     params: {
//       token: token,
//     },
//   });
export const getPermits = async () =>
  axiosInstance.get("/permits.json", {
    params: {
      token: token,
    },
  });
export const getPermitDetails = async (permitId) =>
  axiosInstance.get(`/permits/${permitId}.json`, {
    params: {
      token: token,
    },
  });
export const editPermit = async (id, data) =>
  axiosInstance.put(`/permits/${id}.json`, data, {
    params: {
      token: token,
    },
  });
//services
export const getServicesTaskDetails = async (serviceId, activityId) =>
  axiosInstance.get(
    `/submissions.json?q[soft_service_id_eq]=${serviceId}&q[activity_id_eq]=${activityId}`,
    {
      params: {
        token: token,
      },
    }
  );

export const postSoftServices = async (data) =>
  axiosInstance.post("/soft_services.json", data, {
    params: {
      token: token,
    },
  });
export const EditSoftServices = async (data, id) =>
  axiosInstance.put(`/soft_services/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getSoftServicesDetails = async (id) =>
  axiosInstance.get(`/soft_services/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getSoftServiceSchedule = async (sid) =>
  axiosInstance.get(`/soft_services/${sid}/softservices_log_show.json`, {
    params: {
      token: token,
    },
  });
export const getSoftserviceActivityDetails = async (id) =>
  axiosInstance.get(`/soft_services/${id}/softservices_log_show.json?`, {
    params: {
      token: token,
    },
  });
export const deleteAssociationList = async (
  checklistId,
  assignedto,
  serviceId
) =>
  axiosInstance.get(
    `/delete_user_activity.json?checklist_id=${checklistId}&assigned_to=${assignedto}&asset_id=&soft_service_id=${serviceId}`,
    {
      params: {
        token: token,
      },
    }
  );

export const postServiceAssociation = async (data) =>
  axiosInstance.post(`/activities.json`, data, {
    params: {
      token: token,
    },
  });

export const getSoftServices = async () =>
  axiosInstance.get("/soft_services.json", {
    params: {
      token: token,
    },
  });
export const getServicesChecklist = async () =>
  axiosInstance.get("/checklists.json?q[ctype_eq]=soft_service", {
    params: {
      token: token,
    },
  });
export const postChecklist = async (data) =>
  axiosInstance.post("/checklists.json", data, {
    params: {
      token: token,
    },
  });
export const postGDN = async (data) =>
  axiosInstance.post("/gdn_details.json", data, {
    params: {
      token: token,
    },
  });
export const getGDN = async () =>
  axiosInstance.get("/gdn_details.json", {
    params: {
      token: token,
    },
  });
export const getSiteOwner = async () =>
  axiosInstance.get("/get_site_owner.json?q[info_type_eq]=SiteOwner", {
    params: {
      token: token,
    },
  });
export const getChecklistGroupReading = async () =>
  axiosInstance.get("/generic_infos.json?q[info_type_eq]=GroupReading", {
    params: {
      token: token,
    },
  });
export const getGDNPurposeSetup = async () =>
  axiosInstance.get("/generic_infos.json?q[info_type_eq]=GdnPurpose", {
    params: {
      token: token,
    },
  });
export const getGDNConsumingSetup = async () =>
  axiosInstance.get("/generic_infos.json?q[info_type_eq]=GdnConsumingIn", {
    params: {
      token: token,
    },
  });
export const getSiteOwnerDetails = async (id) =>
  axiosInstance.get(`/generic_infos/${id}.json`, {
    params: {
      token: token,
    },
  });
export const EditSiteOwner = async (id, data) =>
  axiosInstance.put(`/generic_infos/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postSiteOwner = async (data) =>
  axiosInstance.post("/generic_infos.json", data, {
    params: {
      token: token,
    },
  });
export const getGenericGroupAssetChecklist = async () =>
  axiosInstance.get(`/generic_infos.json?q[info_type_eq]=checklist`, {
    params: {
      token: token,
    },
  });
export const getGenericSubGroupAssetChecklist = async (groupid) =>
  axiosInstance.get(
    `/generic_sub_infos.json?q[generic_info_id_eq]=${groupid}`,
    {
      params: {
        token: token,
      },
    }
  );
export const getGenericGroup = async () =>
  axiosInstance.get(`/generic_infos.json?q[info_type_eq]=soft_services`, {
    params: {
      token: token,
    },
  });
export const getGenericSubGroup = async (groupid) =>
  axiosInstance.get(
    `/generic_sub_infos.json?q[generic_info_id_eq]=${groupid}`,
    {
      params: {
        token: token,
      },
    }
  );
export const editChecklist = async (data, id) =>
  axiosInstance.put(`/checklists/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getServicesChecklistDetails = async (checklistId) =>
  axiosInstance.get(`/checklists.json/${checklistId}`, {
    params: {
      token: token,
    },
  });

export const getAssetPPMList = async () =>
  axiosInstance.get(`/checklists.json?q[ctype_eq]=ppm`, {
    params: {
      token: token,
    },
  });
export const getServicesPPMDetails = async (id) =>
  axiosInstance.get(`/checklists/${id}.json?q[ctype_eq]=ppm`, {
    params: {
      token: token,
    },
  });

//
export const getServicesRoutineList = async (page, perpage, startDate = null, endDate = null) => {
  let url = `/activities.json?q[soft_service_id_null]=0&per_page=${perpage}&page=${page}`;
  
  if (startDate) {
    url += `&q[start_time_gteq]=${startDate}`;
  }
  if (endDate) {
    url += `&q[start_time_lteq]=${endDate}`;
  }
  
  return axiosInstance.get(url, {
    params: {
      token: token,
    },
  });
};
export const getServicesTaskList = async () =>
  axiosInstance.get(`/soft_services/soft_services_dashboard.json?`, {
    params: {
      token: token,
    },
  });
export const postServicePR = async (data) =>
  axiosInstance.post(`/service_orders.json`, data, {
    params: {
      token: token,
    },
  });
export const postFacilitySetup = async (data) =>
  axiosInstance.post(`/amenities.json`, data, {
    params: {
      token: token,
    },
  });
export const postParkingSlots = async (data) =>
  axiosInstance.post(`/parking_slots.json`, data, {
    params: {
      token: token,
    },
  });
export const postParkingConfiguration = async (data) =>
  axiosInstance.post(`/parking_configurations.json`, data, {
    params: {
      token: token,
    },
  });
export const postParking = async (data) =>
  axiosInstance.post(`/booking_parkings.json`, data, {
    params: {
      token: token,
    },
  });

// Permit Entity
export const fetchPermitEntity = async () => {
  try {
    const response = axiosInstance.get(`/permit_entities.json`, {
      params: {
        token: token,
      },
    });
    return response;
  } catch (error) {
    console.log("handling entities error:", error);
  }
};
// Permit Detail Activity
export const postPermitSubActivity = async (data) =>
  axiosInstance.post(`/permit_sub_activities.json`, data, {
    params: {
      token: token,
    },
  });
export const getPermitSubActivity = async () =>
  axiosInstance.get(`/permit_sub_activities.json`, {
    params: {
      token: token,
    },
  });
export const getPermitSubActivityDetails = async (id) =>
  axiosInstance.get(`/permit_sub_activities/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editPermitSubActivity = async (id, data) =>
  axiosInstance.put(`/permit_sub_activities/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const deletePermitSubActivity = async (id) =>
  axiosInstance.delete(`/permit_sub_activities/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postPermitActivity = async (data) =>
  axiosInstance.post(`/permit_activity_setups.json`, data, {
    params: {
      token: token,
    },
  });

// Permit Risk
export const postPermitRisks = async (data) =>
  axiosInstance.post(`/permit_risks.json`, data, {
    params: {
      token: token,
    },
  });
export const getPermitRisks = async () =>
  axiosInstance.get(`/permit_risks.json`, {
    params: {
      token: token,
    },
  });
export const getPermitRisksDetails = async (id) =>
  axiosInstance.get(`/permit_risks/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editPermitRisks = async (id, data) =>
  axiosInstance.put(`/permit_risks/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const deletePermitRisks = async (id) =>
  axiosInstance.delete(`/permit_risks/${id}.json`, {
    params: {
      token: token,
    },
  });
// Hazards Category
export const postHazardCategory = async (data) =>
  axiosInstance.post(`/hazard_categories.json`, data, {
    params: {
      token: token,
    },
  });
export const getHazardCategoryDetails = async (id) =>
  axiosInstance.get(`/hazard_categories/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editHazardCategory = async (id, data) =>
  axiosInstance.put(`/hazard_categories/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const deleteHazardCategory = async (id) =>
  axiosInstance.delete(`/hazard_categories/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getHazardCategory = async () =>
  axiosInstance.get(`/hazard_categories.json`, {
    params: {
      token: token,
    },
  });

// Permit Activity Setup
export const getPermitActivityDetails = async (id) =>
  axiosInstance.get(`/permit_activity_setups/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editPermitActivity = async (id, data) =>
  axiosInstance.put(`/permit_activity_setups/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getPermitActivity = async () =>
  axiosInstance.get(`/permit_activity_setups.json`, {
    params: {
      token: token,
    },
  });
export const deletePermitActivity = async (id) =>
  axiosInstance.delete(`/permit_activity_setups/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postPermitType = async (data) =>
  axiosInstance.post(`/permit_types.json`, data, {
    params: {
      token: token,
    },
  });
export const postPermitSafetyEquipment = async (data) =>
  axiosInstance.post(`/permit_safety_equipments.json`, data, {
    params: {
      token: token,
    },
  });
export const getPermitSafetyEquipmentDetails = async (id) =>
  axiosInstance.get(`/permit_safety_equipments/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editPermitSafetyEquipment = async (id, data) =>
  axiosInstance.put(`/permit_safety_equipments/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const deletePermitSafetyEquipment = async (id) =>
  axiosInstance.delete(`/permit_safety_equipments/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getPermitSafetyEquipment = async () =>
  axiosInstance.get(`/permit_safety_equipments.json`, {
    params: {
      token: token,
    },
  });
export const getPermitType = async () =>
  axiosInstance.get(`/permit_types.json`, {
    params: {
      token: token,
    },
  });
export const getPermitTypeDetails = async (id) =>
  axiosInstance.get(`/permit_types/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editPermitType = async (id, data) =>
  axiosInstance.put(`/permit_types/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const deletePermitType = async (id) =>
  axiosInstance.delete(`/permit_types/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getParkingSlotDetails = async (id) =>
  axiosInstance.get(`/parking_slots/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getParkingSlots = async () =>
  axiosInstance.get(`/parking_slots.json`, {
    params: {
      token: token,
    },
  });

export const getBookParking = async () =>
  axiosInstance.get(`/booking_parkings.json`, {
    params: {
      token: token,
    },
  });

export const fetchParkingDetail = async (id) =>
  axiosInstance.get(`/parking_configurations/${id}.json`, {
    params: {
      token: token,
    },
  });

export const deleteBookParking = async (id) =>
  axiosInstance.delete(`/booking_parkings/${id}.json`, {
    params: {
      token: token,
    },
  });

export const getAvailableParkingNumber = async () =>
  axiosInstance.get(`/available_parking_configurations.json`, {
    params: {
      token: token,
    },
  });
export const editParkingConfiguration = async (id, data) =>
  axiosInstance.put(`/parking_configurations/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getParkingConfigurationDetails = async (id) =>
  axiosInstance.get(`/parking_configurations/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getParkingConfiguration = async () =>
  axiosInstance.get(`/parking_configurations.json`, {
    params: {
      token: token,
    },
  });
export const editParkingSlots = async (id, data) =>
  axiosInstance.put(`/parking_slots/${id}.json`, data, {
    params: {
      token: token,
    },
  });
// export const getServicesRoutineList = async () =>
//   axiosInstance.get(`/checklists.json?q[ctype_eq]=routine`, {
//     params: {
//       token: token,
//     },
//   });
export const getFolderDocumentCommon = async () =>
  axiosInstance.get(`/folders/get_folders.json`, {
    params: {
      token: token,
    },
  });
export const getFolderDocumentPersonal = async () =>
  axiosInstance.get(`/folders/get_personal_folders.json`, {
    params: {
      token: token,
    },
  });
export const getSharedwith = async () =>
  axiosInstance.get(`/folders/get_share_with.json`, {
    params: {
      token: token,
    },
  });
export const getSubFolderDocumentCommon = async (id) =>
  axiosInstance.get(`/folders/get_folders.json?parent_id=${id}`, {
    params: {
      token: token,
    },
  });
export const postSharePersonal = async (data) =>
  axiosInstance.post("/share_withs.json", data, {
    params: {
      token: token,
    },
  });
export const deleteFolderPersonal = async (id) =>
  axiosInstance.delete(`/destroy_folder/${id}.json`, {
    params: {
      token: token,
    },
  });
export const deleteFilePersonal = async (id) =>
  axiosInstance.delete(`/folder_documents/${id}.json`, {
    params: {
      token: token,
    },
  });
export const deleteShareFolder = async (id) =>
  axiosInstance.delete(`/share_withs/${id}.json`, {
    params: {
      token: token,
    },
  });
export const deleteShareFile = async (id) =>
  axiosInstance.delete(`/share_withs/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postFolderDocumentCommon = async (data) =>
  axiosInstance.post("/folders/create_common_folder.json", data, {
    params: {
      token: token,
    },
  });
export const postFolderDocumentPersonal = async (data) =>
  axiosInstance.post("/folders/share_personal_documents.json", data, {
    params: {
      token: token,
    },
  });
export const postFileDocumentCommon = async (data) =>
  axiosInstance.post("/folder_documents/create_common_document.json", data, {
    params: {
      token: token,
    },
  });
export const getServicesRoutineDetails = async (id) =>
  axiosInstance.get(`/checklists/${id}.json?q[ctype_eq]=routine`, {
    params: {
      token: token,
    },
  });
export const getExpectedMobile = async (mobile) =>
  axiosInstance.get(`/visitors/get_visitor.json?mobile=${mobile}`, {
    params: {
      token: token,
    },
  });
export const getExpectedVisitor = async (page = 1, perPage = 10, filters = {}) => {
  const params = {
    token: token,
    page: page,
    per_page: perPage,
  };
  
  // Add dynamic filters
  if (filters.visitorInOut) {
    params['q[visitor_in_out_eq]'] = filters.visitorInOut;
  }
  if (filters.userType) {
    params['q[user_type_eq]'] = filters.userType;
  }
  if (filters.userTypeNotEq) {
    params['q[user_type_not_eq]'] = filters.userTypeNotEq;
  }
  
  // Add date range filters
  if (filters.dateFrom) {
    params['q[expected_date_gteq]'] = filters.dateFrom; // greater than or equal
  }
  if (filters.dateTo) {
    params['q[expected_date_lteq]'] = filters.dateTo; // less than or equal
  }
  
  // Add mobile number filter
  if (filters.mobile) {
    params['q[contact_no_cont]'] = filters.mobile; // contains
  }
  
  // Add host filter (searching through host.user relationship)
  if (filters.host) {
    params['q[host_user_firstname_or_host_user_lastname_cont]'] = filters.host;
  }
  
  return axiosInstance.get(`/visitors.json`, { params });
};
export const getExpectedUserVisitor = async () =>
  axiosInstance.get(`/visitors/user.json`, {
    params: {
      token: token,
    },
  });
export const getRegisteredVehicle = async () =>
  axiosInstance.get(`/registered_vehicles.json`, {
    params: {
      token: token,
    },
  });
export const getRegisteredVehicleDetails = async (id) =>
  axiosInstance.get(`/registered_vehicles/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getPatrollingHistory = async () =>
  axiosInstance.get(`/patrolling_histories.json`, {
    params: {
      token: token,
    },
  });
export const editRegisteredVehicleDetails = async (id, data) =>
  axiosInstance.put(`/registered_vehicles/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const postRegisteredVehicle = async (data) =>
  axiosInstance.post(`/registered_vehicles.json`, data, {
    params: {
      token: token,
    },
  });
export const getParkingConfig = async () =>
  axiosInstance.get(`/parking_configurations.json`, {
    params: {
      token: token,
    },
  });
export const getVisitorApprovals = async (page = 1, perPage = 10) =>
  axiosInstance.get(`/visitors/approval_form.json`, {
    params: {
      token: token,
      page: page,
      per_page: perPage,
    },
  });
export const visitorApproval = async (id, data) =>
  axiosInstance.patch(`/visitors/${id}/approve_visitor.json`, data, {
    params: {
      token: token,
    },
  });
export const getVisitorHistory = async (page = 1, perPage = 10) =>
  axiosInstance.get(`/visitors/approval_history.json`, {
    params: {
      token: token,
      page: page,
      per_page: perPage,
    },
  });
export const getVisitorDetails = async (id) =>
  axiosInstance.get(`/visitors/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editVisitorDetails = async (id, data) =>
  axiosInstance.put(`/visitors/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const getVisitorCategory = async () =>
  axiosInstance.get("/visitor_staff_category.json", {
    params: {
      token: token,
    },
  });

export const postVisitorCategory = async (data) =>
  axiosInstance.post("/visitor_staff_categories.json", data, {
    params: {
      token: token,
    },
  });

export const deleteVisitorCategory = async (id) =>
  axiosInstance.delete(`/visitor_staff_categories/${id}.json`, {
    params: {
      token: token,
    },
  });

export const getVisitorCategoryDetails = async (id) =>
  axiosInstance.get(`/visitor_staff_categories/${id}.json`, {
    params: {
      token: token,
    },
  });

export const editVisitorCategory = async (id, data) =>
  axiosInstance.patch(`/visitor_staff_categories/${id}.json`, data, {
    params: {
      token: token,
    },
  });

// Visitor Alert Config APIs
export const getVisitorAlertConfig = async () =>
  axiosInstance.get("/visitor_alert_config.json", {
    params: {
      token: token,
    },
  });

export const updateVisitorAlertConfig = async (data) =>
  axiosInstance.post("/visitor_alert_config.json", data, {
    params: {
      token: token,
    },
  });

export const postLOI = async (data) =>
  axiosInstance.post(`/loi_details.json`, data, {
    params: {
      token: token,
    },
  });
export const getLOI = async () =>
  axiosInstance.get(`/loi_details.json`, {
    params: {
      token: token,
    },
  });
export const getServicePR = async () =>
  axiosInstance.get(`/loi_services.json`, {
    params: {
      token: token,
    },
  });
export const getLOIDetails = async (id) =>
  axiosInstance.get(`/loi_details/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getLOIItems = async () =>
  axiosInstance.get(`/loi_items.json`, {
    params: {
      token: token,
    },
  });
export const getLOIItemsDetails = async (id) =>
  axiosInstance.get(`/loi_items/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postLOIItems = async (data) =>
  axiosInstance.post(`/loi_items.json`, data, {
    params: {
      token: token,
    },
  });
export const getStandardUnits = async () =>
  axiosInstance.get(`/standard_units.json`, {
    params: {
      token: token,
    },
  });
export const getContactBook = async () =>
  axiosInstance.get(`/contact_books.json`, {
    params: {
      token: token,
    },
  });
export const postContactBook = async (data) =>
  axiosInstance.post(`/contact_books.json`, data, {
    params: {
      token: token,
    },
  });
export const editContactBook = async (id, data) =>
  axiosInstance.put(`/contact_books/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getGenericCategory = async () =>
  axiosInstance.get(`/generic_infos.json`, {
    params: {
      token: token,
    },
  });
export const getGenericCategoryRestaurtant = async () =>
  axiosInstance.get(`/generic_infos.json?q[info_type_eq]=RestaurantCategory`, {
    params: {
      token: token,
    },
  });
export const getCuisinesFBSetup = async () =>
  axiosInstance.get(`/generic_infos.json?q[info_type_eq]=Cuisins`, {
    params: {
      token: token,
    },
  });
export const getFixedStatusSetup = async () =>
  axiosInstance.get(`/generic_infos.json?q[info_type_eq]=FixedStatus`, {
    params: {
      token: token,
    },
  });
export const postStatusSetup = async (data) =>
  axiosInstance.post(`/status_restaurants.json`, data, {
    params: {
      token: token,
    },
  });
export const getStatusSetupDetails = async (id) =>
  axiosInstance.get(`/status_restaurants/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editStatusSetup = async (id, data) =>
  axiosInstance.put(`/status_restaurants/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getStatusSetup = async () =>
  axiosInstance.get(`/status_restaurants.json`, {
    params: {
      token: token,
    },
  });
export const getGenericCategoryDetails = async (id) =>
  axiosInstance.get(`/generic_infos/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editGenericCategoryDetails = async (id, data) =>
  axiosInstance.put(`/generic_infos/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getGenericSubCategoryDetails = async (id) =>
  axiosInstance.get(`/generic_sub_infos/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editGenericSubCategoryDetails = async (id, data) =>
  axiosInstance.put(`/generic_sub_infos/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postGenericCategory = async (data) =>
  axiosInstance.post(`/generic_infos.json`, data, {
    params: {
      token: token,
    },
  });
export const postGenericSubCategory = async (data) =>
  axiosInstance.post(`/generic_sub_infos.json`, data, {
    params: {
      token: token,
    },
  });
export const getGenericSubCategory = async () =>
  axiosInstance.get(`/generic_sub_infos.json`, {
    params: {
      token: token,
    },
  });
export const getDependentGenericSubCategory = async (id) =>
  axiosInstance.get(`/generic_sub_infos.json?generic_info_id=${id}`, {
    params: {
      token: token,
    },
  });
export const getContactBookDetails = async (id) =>
  axiosInstance.get(`/contact_books/${id}.json`, {
    params: {
      token: token,
    },
  });

// setup
export const getCompanies = async () =>
  axiosInstance.get(`/sites/company_list.json`, {
    params: {
      token: token,
    },
  });
export const createCompany = async (data) =>
  axiosInstance.post(`/companies.json`, data, {
    params: {
      token: token,
    },
  });
export const getAllFeature = async () =>
  axiosInstance.get(`/sites/all_features.json`, {
    params: {
      token: token,
    },
  });
export const getBuildings = async () =>
  axiosInstance.get(`/buildings.json`, {
    params: {
      token: token,
    },
  });

export const getSites = async () =>
  axiosInstance.get(`/sites.json`, {
    params: {
      token: token,
    },
  });
export const getSiteDetails = async (id) =>
  axiosInstance.get(`/sites/${id}.json`, {
    params: {
      token: token,
    },
  });
export const EditSiteDetails = async (id, data) =>
  axiosInstance.put(`/sites/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postSite = async (data) =>
  axiosInstance.post(`/sites.json`, data, {
    params: {
      token: token,
    },
  });
export const postBuilding = async (data) =>
  axiosInstance.post(`/buildings.json`, data, {
    params: {
      token: token,
    },
  });
export const getAllFloors = async () =>
  axiosInstance.get(`/floors.json`, {
    params: {
      token: token,
    },
  });
export const getFloorDetails = async (id) =>
  axiosInstance.get(`/floors/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editFloorDetails = async (id, data) =>
  axiosInstance.put(`/floors/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postNewFloor = async (data) =>
  axiosInstance.post(`/floors.json`, data, {
    params: {
      token: token,
    },
  });
export const getAllUnits = async () =>
  axiosInstance.get(`/units.json`, {
    params: {
      token: token,
    },
  });
export const getUnitDetails = async (id) =>
  axiosInstance.get(`/units/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editUnitDetails = async (id, data) =>
  axiosInstance.put(`/units/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const postNewUnit = async (data) =>
  axiosInstance.post(`/units.json`, data, {
    params: {
      token: token,
    },
  });
export const getAllAddress = async () =>
  axiosInstance.get(`/addresses.json`, {
    params: {
      token: token,
    },
  });
export const getAddressDetails = async (id) =>
  axiosInstance.get(`/addresses/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postAddress = async (data) =>
  axiosInstance.post(`/addresses.json`, data, {
    params: {
      token: token,
    },
  });
export const editAddress = async (id, data) =>
  axiosInstance.put(`/addresses/${id}.json`, data, {
    params: {
      token: token,
    },
  });

// vibe

export const vibeLogin = async (data) => vibeAuth.post("/api/login/", data);

// VIBE CALENDAR
export const getVibeCalendar = async (vibeUserId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/calender/get-calender-events/?user_id=${vibeUserId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};

//VIBE USER
export const getVibeUsers = async (vibeUserId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-users/?user_id=${vibeUserId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};
export const getVibeProjectUsers = async (vibeUserId, orgId, boardId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-users/?user_id=${vibeUserId}&org_id=${orgId}&board_id=${boardId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};
export const getProjectUsers = async (vibeUserId, vibeOrgId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-users/?user_id=${vibeUserId}&org_id=${vibeOrgId}&os:false`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project users events:", error);
    throw error;
  }
};
export const getOutsideUsers = async (vibeUserId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get_outsiders/?user_id=${vibeUserId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching outside users events:", error);
    throw error;
  }
};

// vibe Create calendar event
export const postNewCalendarEvent = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/calender/create-event/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
// vibe Create calendar Task
export const postCalendarTask = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/board/add-task/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};

// vibe meetings
// /api/employee/calender/meet/create-zoom-meeting/
export const CreateVibeZoomMeeting = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/calender/meet/create-zoom-meeting/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const CreateVibeTeamMeeting = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/calender/create-teams-meeting/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const CreateVibeMeeting = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/calender/create-meeting/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const UpdateVibeTask = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/calender/update-calender-event/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
// vibeMyBoardTask
export const getVibeMyBoardTask = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/my_board/get-task/?user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const updateTaskStatus = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/v1/employee/task/update-status/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeTaskUserAssign = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/task/get-task-assigned-users/?user_id=${userId}&task_id=${taskId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const deleteVibeTask = async (userId, taskId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/board/task/trash/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeTaskChecklist = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/get-checklist/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeSubTaskChecklist = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/task/get-subtask/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeActionAndChat = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/task/get-action-and-chats/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeTaskAttachment = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/task/get-attachment/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeComments = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/task/get-comments/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const updateVibeAssignedUser = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/task/update-assign-task/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const updateVibeUserTask = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/v1/employee/task/update_task/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeStatus = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/task/get-status/?user_id=${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const API_URL_WS = "wss://vibecopilot.ai/ws";
export const getVibeMedia = async () => {
  try {
    const response = await vibeAuth.get(
      `https://vibecopilot.ai/api/media/`,

      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const postVibeTaskChat = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/task/add-message/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const postVibeBackground = async (data) => {
  try {
    const response = await vibeAuth.post(`/api/employee/add_bg_image/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeBackground = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get_bg_image/?user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeMeeting = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/calender/get-meeting/?user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const getVibeMeetingDetails = async (userId, meetingId) => {
  try {
    const response = await vibeAuth.get(
      // `/api/employee/calender/get-specific_event/?user_id=32&category=Meeting&object_id=349`,
      `/api/employee/calender/get-specific_event/?user_id=${userId}&category=Meeting&object_id=${meetingId}&summery=true`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting meeting details:", error);
    throw error;
  }
};
export const generateVibeMeetingSummary = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/calender/meet/generate-summery/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating calendar events:", error);
    throw error;
  }
};
export const requestVibeDueDate = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/request/make_request/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Requesting Due Date:", error);
    throw error;
  }
};
export const updateVibeChecklistItems = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/v1/employee/task/update-checklist/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Vibe checklist Items :", error);
    throw error;
  }
};
export const postExistingInsPolicy = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/policy/new/create/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting existing policy:", error);
    throw error;
  }
};

export const getPolicies = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/policy/new/get/?user_id=${userId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting existing policy:", error);
    throw error;
  }
};

export const updateSalesView = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/filter/add-filter/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating sales view :", error);
    throw error;
  }
};
export const postVibeChecklist = async (data) => {
  try {
    const response = await vibeAuth.post(
      // `/api/employee/task/create-task-checklist/`,
      `/api/v1/employee/task/create-checklist/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating checklist :", error);
    throw error;
  }
};
export const deleteVibeTaskChecklist = async (
  taskDeleteIDCheckList,
  user_id
) => {
  try {
    const response = await vibeAuth.delete(
      `/api/v1/employee/task/delete-checklist/?checklist_id=${taskDeleteIDCheckList}&user_id=${user_id}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating checklist :", error);
    throw error;
  }
};
export const updateVibeSubTask = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/v1/employee/task/update_task/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating checklist :", error);
    throw error;
  }
};
export const updateVibeUserSubTask = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/task/sub_task/update-checklist-task/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subtask :", error);
    throw error;
  }
};
export const createVibeChecklistSubTask = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/v1/employee/create_task/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Creating subtask :", error);
    throw error;
  }
};
export const deleteVibeSubTask = async (taskId, userId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/task/checklist/task/trash/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Creating subtask :", error);
    throw error;
  }
};
export const createVibeChildSubTask = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/subtask/child/create/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Creating child subtask :", error);
    throw error;
  }
};
export const updateSubTaskChild = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/subtask/child/update/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating child subtask :", error);
    throw error;
  }
};
export const deleteTaskChecklistSubTaskChild = async (taskChildId, userId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/subtask/child/delete/?task_child_id=${taskChildId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating child subtask :", error);
    throw error;
  }
};
export const addVibeTaskAttachment = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/task/add-attachment/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting Attachments :", error);
    throw error;
  }
};
export const deleteVibeTaskAttachment = async (attachmentId, taskId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/task/delete-attachment/?attachment_id=${attachmentId}&task_id=${taskId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting Attachments :", error);
    throw error;
  }
};
export const postNewProjectBoard = async (data) => {
  try {
    const response = await vibeAuth.post(`/api/employee/add-board/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting new board :", error);
    throw error;
  }
};
export const getVibeSocialData = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/social-media/get-auth-info/?user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting social data :", error);
    throw error;
  }
};
export const getGmailAuthenticate = async (platform) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/social-media/gmail/get-auth/?platform=${platform}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting gmail data :", error);
    throw error;
  }
};
export const updateLoginGmailStatus = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/social-media/gmail/update-status-login/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting gmail data :", error);
    throw error;
  }
};
export const addGmailAuthenticate = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/social-media/gmail/create-auth/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding gmail data :", error);
    throw error;
  }
};
export const getVibeUserBoard = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-user-board/?user_id=${userId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding gmail data :", error);
    throw error;
  }
};
export const deleteVibeUserBoard = async (boardId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/delete-board?board_id=${boardId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting board :", error);
    throw error;
  }
};
export const updateVibeBoardDate = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/board/update_date/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating board date :", error);
    throw error;
  }
};
export const getVibeBoardTemplate = async (userID) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-template/?user_id=${userID}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Getting project template :", error);
    throw error;
  }
};
export const updateVibeBoardTemplate = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/update-board-template/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating project template :", error);
    throw error;
  }
};
export const getVibeBoardData = async (boardId, userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/custom_board/get-task/?board_id=${boardId}&user_id=${userId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting project data :", error);
    throw error;
  }
};
export const getVibeBoardUser = async (userId, orgId, boardId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-board-users/?user_id=${userId}&org_id=${orgId}&board_id=${boardId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting project data :", error);
    throw error;
  }
};
export const getVibeCalenderEventsNew = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/calender/get-events/?user_id=${userId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting new events data :", error);
    throw error;
  }
};
export const deleteVibeCalenderTask = async (userId, category, id) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/calender/delete-calender-event/?user_id=${userId}&category=${category}&id=${id}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleing task data :", error);
    throw error;
  }
};
export const createVibeSchedule = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/work_schedule/create-schedule/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Creating Schedule :", error);
    throw error;
  }
};
export const getVibeSchedule = async (userID, startDate, endDate) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/work_schedule/get-schedule/?user_id=${userID}&from_date=${startDate}&to_date=${endDate}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Schedule :", error);
    throw error;
  }
};
export const getVibeTodaySlots = async (userId, fromDate, endDate) => {
  try {
    const response = await vibeAuth.get(
      `/api/doctor/get-today-my-slots/?user_id=${userId}&from_date=${fromDate}&to_date=${endDate}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting slots :", error);
    throw error;
  }
};
export const postVisitorOTPApi = async (data) => {
  try {
    const response = await vibeAuth.post(
      `https://vibecopilot.ai/api/send-test-otp/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting slots :", error);
    throw error;
  }
};
export const postOutlookAuth = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/social-media/outlook/create-auth/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting slots :", error);
    throw error;
  }
};
export const getProjectTaskDependencies = async (userId, boardId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/get-dependencies/?user_id=${userId}&board_id=${boardId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting dependencies :", error);
    throw error;
  }
};
export const getDependencies = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/get-dependencies/?user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting dependencies :", error);
    throw error;
  }
};
export const getVibeUserBirthday = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/calender/get-users-birthday/?user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting birthday :", error);
    throw error;
  }
};
export const createVibeUserBirthday = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/calender/add-birthday/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Creating birthday :", error);
    throw error;
  }
};
export const deleteVibeUserBirthday = async (userId, BdId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/calender/delete-birthday/?user_id=${userId}&birthday_id=${BdId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting birthday :", error);
    throw error;
  }
};
export const postVibeTaskComment = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/v1/employee/task/add-comment/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Creating Comment :", error);
    throw error;
  }
};
export const getVibeMainTaskDependencies = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/get-depend_on/?user_id=${userId}&task_id=${taskId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting dependent task :", error);
    throw error;
  }
};
export const GetTaskBulk = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/children/get_task_bulk/?user_id=${userId}&task_id=${taskId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting bulk task :", error);
    throw error;
  }
};
export const GetVibeBoardTaskPermission = async (userId, boardId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/board/get_task_permission/?user_id=${userId}&board_id=${boardId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting task permission:", error);
    throw error;
  }
};
export const updateChecklistSequence = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/board/checklist/update-checklist-sequence/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating checklist sequence :", error);
    throw error;
  }
};
export const Updatetaskchecklist = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/v1/employee/task/relocate-task/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating task checklist :", error);
    throw error;
  }
};
export const UpdateTaskAction = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/task/add-task-action/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating task action :", error);
    throw error;
  }
};
export const UpdateProjectSectionTitle = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/board/update-board-checklist/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating title :", error);
    throw error;
  }
};

export const deleteSection = async (taskDeleteIDSection, userId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/employee/board/delete-board-checklist/?check_id=${taskDeleteIDSection}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting section :", error);
    throw error;
  }
};
export const addBoardChecklist = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/board/add-board-checklist/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting section :", error);
    throw error;
  }
};

export const deleteProjectTask = async (taskId, userId) => {
  try {
    const response = await vibeAuth.delete(
      `/api/v1/employee/tasks/trash/?task_id=${taskId}&user_id=${userId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting task :", error);
    throw error;
  }
};
export const getProjectAssignedUser = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/get_task_assigned_users?user_id=${userId}&task_id=${taskId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting task :", error);
    throw error;
  }
};
export const updateProjectAssigned = async (data) => {
  try {
    const response = await vibeAuth.put(
      `/api/employee/board/update-board-assign/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating assign :", error);
    throw error;
  }
};
export const postOutSiderInvite = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/outsider/invite/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Assign task :", error);
    throw error;
  }
};
export const getTaskUsersAssign = async (userId, taskId) => {
  try {
    const response = await vibeAuth.get(
      `/api/v1/employee/task/get_task_assigned_users/?user_id=${userId}&task_id=${taskId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Assign task :", error);
    throw error;
  }
};
export const getBoardSection = async (userId, boardId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/board/get_board_sections/?user_id=${userId}&board_id=${boardId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Assign task :", error);
    throw error;
  }
};
export const getDocAppointmentList = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-appointment-list/?user_id=${userId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting appointment list :", error);
    throw error;
  }
};
export const getDocCancelCheck = async (userId, consultId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/check-cancel/?user_id=${userId}&consultation_id=${consultId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting cancellation :", error);
    throw error;
  }
};
export const postDocCancellation = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/doctor/cancel-consultation/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting cancellation :", error);
    throw error;
  }
};
export const getConsultationDetails = async (userId) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-consultation-details/?user_id=${userId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting cancellation :", error);
    throw error;
  }
};
export const getOrganizations = async (userId, orgId) => {
  try {
    const response = await vibeAuth.get(
      `/api/organization/get-organization-branch/?user_id=${userId}&org_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting organization :", error);
    throw error;
  }
};
export const getDoctors = async (
  userId,
  date,
  orgId,
  meetingMode,
  branchId
) => {
  try {
    const response = await vibeAuth.get(
      `/api/employee/get-doctors/?user_id=${userId}&date=${date}&organization_id=${orgId}&meeting_mode=${meetingMode}&branch_id=${branchId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting doctors :", error);
    throw error;
  }
};
export const getTimeSlot = async (
  userId,
  date,
  orgId,
  meetingMode,
  doctorId
) => {
  try {
    const response = await vibeAuth.get(
      `/api/doctor/get-slots/?user_id=${userId}&date=${date}&organization_id=${orgId}&meeting_mode=${meetingMode}&doctor_id=${doctorId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting doctors :", error);
    throw error;
  }
};
export const postDocAppointment = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/book-doctor-consultation/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting appointment :", error);
    throw error;
  }
};
export const sendBusinessCard = async (data) => {
  try {
    const response = await vibeAuth.post(
      `/api/employee/card/send-business_card/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending business card :", error);
    throw error;
  }
};
// HRMS
// Hrms active and inactive user
export const getStatusChanges = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee-bulk/manage-employee-status/`,
      data
    );
    return response.data;
  } catch (error) {
    console.log("Error changing the status of the employee", error);
    throw error;
  }
};
export const CreateBulkEmployee = async (FormData) => {
  try {
    const response = await HrmsAuth.post(`/employee/excel-upload/`, FormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error Creating Bulk user ", error);
    throw error;
  }
};
export const getAllHrmsOrganisation = async () => {
  try {
    const response = await HrmsAuth.get(`/organization/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting HRMS organisation :", error);
    throw error;
  }
};
export const getMyOrganization = async (orgHrId) => {
  try {
    const response = await HrmsAuth.get(`/organization/${orgHrId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting My organisation :", error);
    throw error;
  }
};
export const editMyOrganization = async (orgHrId, data) => {
  try {
    const response = await HrmsAuth.put(`/organization/${orgHrId}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing My organisation :", error);
    throw error;
  }
};
export const getAllOrganizationAddress = async () => {
  try {
    const response = await HrmsAuth.get(`/organization/address/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing My organisation :", error);
    throw error;
  }
};
// my organization
export const getMyOrganizationAddress = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/address/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting My organization :", error);
    throw error;
  }
};
export const getOrganizationAddress = async (addressId) => {
  try {
    const response = await HrmsAuth.get(`/organization/address/${addressId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error editing My organisation :", error);
    throw error;
  }
};
export const editOrganizationAddress = async (addressId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/address/${addressId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing Address :", error);
    throw error;
  }
};
export const postOrganizationAddress = async (data) => {
  try {
    const response = await HrmsAuth.post(`/organization/address/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting Address :", error);
    throw error;
  }
};
export const getAllOrganizationGeoSettings = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/geographical-settings/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing Geo settings :", error);
    throw error;
  }
};
export const getOrganizationGeoMasterData = async (geoId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/geographical-master-data/${geoId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Geo master data :", error);
    throw error;
  }
};
export const editOrganizationGeoSettings = async (geoId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/geographical-settings/${geoId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing Geo settings :", error);
    throw error;
  }
};
export const postOrganizationGeoSettings = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/organization/geographical-settings/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing Geo settings :", error);
    throw error;
  }
};
// location
export const getMyOrganizationLocations = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/location/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Locations :", error);
    throw error;
  }
};
export const postMyOrganizationLocations = async (data) => {
  try {
    const response = await HrmsAuth.post(`/organization/location/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error post Locations :", error);
    throw error;
  }
};

export const getOrganizationLocation = async (locationId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/location/${locationId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Location :", error);
    throw error;
  }
};
export const editOrganizationLocation = async (locationId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/location/${locationId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing Location :", error);
    throw error;
  }
};
export const getMyOrgDepartments = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/department/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting department :", error);
    throw error;
  }
};

export const getMyHRMSEmployees = async (orgId) => {
  try {
    const response = await HrmsAuth.get(`/employee/?organization_id=${orgId}`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting employee :", error);
    throw error;
  }
};
export const getMyHRMSAdmins = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/?organization_id=${orgId}&user_type=pms_admin`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee :", error);
    throw error;
  }
};
export const getMyHRMSEmployeesAllData = async (orgId, page = 1) => {
  try {
    const response = await HrmsAuth.get(
      `/user-details/?organization_id=${orgId}&page=${page}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee :", error);
    throw error;
  }
};
export const getHrmsAllEmployeeData = async (orgId, page = 1) => {
  try {
    const response = await HrmsAuth.get(
      `/updated-user-details/?organization_id=${orgId}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting the All employee data", error);
    throw error;
  }
};

export const getHrmsFilteredEmployeeData = async (
  empId,
  page,
  status = "active",
  siteId = "",
  nameSearch = "",
  idSearch = ""
) => {
  try {
    const params = new URLSearchParams();

    params.append("employee", empId);
    params.append("page", page);

    if (status) params.append("status", status);
    if (siteId) params.append("site_id", siteId);
    if (nameSearch) params.append("name", nameSearch);
    if (idSearch) params.append("id", idSearch);

    const response = await HrmsAuth.get(
      `/admin-site/employee-detailed-list/?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.log("Error Getting the filtered employee data", error);
    throw error;
  }
};

export const deleteHRMSEmployee = async (empId) => {
  try {
    const response = await HrmsAuth.delete(`/employee/${empId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error delete employee :", error);
    throw error;
  }
};
export const addHrmsOrganizationDepartment = async (data) => {
  try {
    const response = await HrmsAuth.post(`/organization/department/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting employee :", error);
    throw error;
  }
};

export const getHrmsDepartmentDetails = async (deptId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/department/${deptId}/`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee :", error);
    throw error;
  }
};
export const deleteHrmsDepartment = async (deptId) => {
  try {
    const response = await HrmsAuth.delete(
      `/organization/department/${deptId}/`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting employee :", error);
    throw error;
  }
};
export const editHrmsOrganizationDepartment = async (deptId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/department/${deptId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee :", error);
    throw error;
  }
};
export const postCompanyHoliday = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/organization/company-holidays/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting company holiday :", error);
    throw error;
  }
};
export const getMyBankAccounts = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/bank-accounts/?organization_id=${orgId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting bank account :", error);
    throw error;
  }
};

export const postMyBankAccounts = async (data) => {
  try {
    const response = await HrmsAuth.post(`/organization/bank-accounts/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting bank account :", error);
    throw error;
  }
};
export const getMyBankDetails = async (bankId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/bank-accounts/${bankId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting bank account :", error);
    throw error;
  }
};
export const deleteMyBankDetails = async (bankId) => {
  try {
    const response = await HrmsAuth.delete(
      `/organization/bank-accounts/${bankId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting bank account :", error);
    throw error;
  }
};
export const editMyBankAccount = async (bankId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/bank-accounts/${bankId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating bank account :", error);
    throw error;
  }
};

export const getManageAdmin = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/user-setting/administrator-setting/?organization_id=${orgId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Admins:", error);
    throw error;
  }
};
export const getAdminAccess = async (orgId, empId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/user-setting/administrator-setting/?organization_id=${orgId}&employee_id=${empId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Admin access:", error);
    throw error;
  }
};
export const getManageAdminDetails = async (adminId) => {
  const hrmsOrgId = getItemInLocalStorage("HRMSORGID");
  try {
    const response = await HrmsAuth.get(
      `/organization/user-setting/administrator-setting/${adminId}/`,
      {
        params: { organization_id: hrmsOrgId },
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Admin detail:", error);
    throw error;
  }
};
export const getUserSettingsIdDetails = async (adminId) => {
  const hrmsOrgId = getItemInLocalStorage("HRMSORGID");
  try {
    const response = await HrmsAuth.get(
      `/organization/user-setting/administrator-setting-new/${adminId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Admin detail:", error);
    throw error;
  }
};
export const getUserSettingsList = async (pageNumber, search) => {
  const hrmsOrgId = getItemInLocalStorage("HRMSORGID");
  try {
    const response = await HrmsAuth.get(
      `/organization/user-setting/administrator-setting-new/?organization_id=${hrmsOrgId}&page=${pageNumber}&search=${search}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Admin detail:", error);
    throw error;
  }
};
export const editManageAdminDetails = async (adminId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/user-setting/administrator-setting/${adminId}/`,
      data
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error edit Admin detail:", error);
    throw error;
  }
};
export const postManageAdmin = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/organization/user-setting/administrator-setting/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting Admins:", error);
    throw error;
  }
};
export const deleteManageAdmin = async (adminId) => {
  try {
    const response = await HrmsAuth.delete(
      `/organization/user-setting/administrator-setting/${adminId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting Admins:", error);
    throw error;
  }
};
export const getEmployeePermission = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee_permission/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting permission:", error);
    throw error;
  }
};
export const editEmployeePermission = async (permissionId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee_permission/${permissionId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating permission:", error);
    throw error;
  }
};
export const getNewsEmployeePermission = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `employee-NewsFeed-permission/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting permission:", error);
    throw error;
  }
};
export const editNewsEmployeePermission = async (newsId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee-NewsFeed-permission/${newsId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating permission:", error);
    throw error;
  }
};
export const getOnBoardingGeneralSetting = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/onboarding-settings/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting onboarding general settings:", error);
    throw error;
  }
};
export const editOnBoardingGeneralSetting = async (settingId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/onboarding-settings/${settingId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting onboarding general settings:", error);
    throw error;
  }
};
export const getCommunicationTemplate = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/communication-template/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting communication template:", error);
    throw error;
  }
};
export const postCommunicationTemplate = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/organization/communication-template/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding communication template:", error);
    throw error;
  }
};
// Employee
export const postEmployeeOnBoarding = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding employee onboarding:", error);
    throw error;
  }
};
export const postEmployeeFamily = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee/family-information/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding employee family:", error);
    throw error;
  }
};
export const postEmployeeAddress = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee/address-information/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding employee address:", error);
    throw error;
  }
};
export const getPaymentModeList = async () => {
  try {
    const response = await HrmsAuth.get(`/employee/payment-mode/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting employee mode list:", error);
    throw error;
  }
};

export const postEmployeePaymentInfo = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee/payment-information/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding employee payment Info:", error);
    throw error;
  }
};
export const getPaymentInfoDetails = async (paymentInfoId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/payment-information/${paymentInfoId}/`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding employee payment Info:", error);
    throw error;
  }
};
export const editPaymentInfoDetails = async (paymentInfoId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee/payment-information/${paymentInfoId}/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding employee payment Info:", error);
    throw error;
  }
};
export const getEmployeePaymentInfo = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/payment-information/?employee_id=${empId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee payment Info:", error);
    throw error;
  }
};
export const postEmployeeStatutoryInfo = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/Statutory/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding employee statutory details:", error);
    throw error;
  }
};
export const editEmployeeStatutoryInfo = async (statId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee/Statutory/${statId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding employee statutory details:", error);
    throw error;
  }
};
export const getEmployeeStatutoryInfoDetails = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/Statutory/?employee_id=${empId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee Statutory:", error);
    throw error;
  }
};
export const getEmployeeDetails = async (empId) => {
  try {
    const response = await HrmsAuth.get(`/employee/${empId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting employee Details:", error);
    throw error;
  }
};

export const editEmployeeDetails = async (empId, data) => {
  try {
    const response = await HrmsAuth.patch(`/employee/${empId}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating employee Details:", error);
    throw error;
  }
};

export const getEmployeeFamilyDetails = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/family-information/?employee_id=${empId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting family Details:", error);
    throw error;
  }
};
export const editEmployeeFamilyDetails = async (familyId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee/family-information/${familyId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating family Details:", error);
    throw error;
  }
};
export const getEmployeeAddressDetails = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/address-information/?employee_id=${empId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting address Details:", error);
    throw error;
  }
};
export const editEmployeeAddressDetails = async (addressId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee/address-information/${addressId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating address Details:", error);
    throw error;
  }
};
export const postEmployeeEmploymentInfo = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employment-information/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting Employment details:", error);
    throw error;
  }
};
export const getCountriesList = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/country-name-list/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Countries list:", error);
    throw error;
  }
};

export const getCountryData = async (countryId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/country-name/?id=${countryId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Country data:", error);
    throw error;
  }
};
export const getEmployeeRegularizationReq = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/attendance/regularization/requests/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting regularization data:", error);
    throw error;
  }
};
export const postRegularizationApproval = async (approvalId, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/attendance/regularization/requests/${approvalId}/`,
      data
      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data/",
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting regularization approval:", error);
    throw error;
  }
};
export const getRegularizationDetails = async (reqId) => {
  try {
    const response = await HrmsAuth.get(
      `/attendance/regularization/requests/${reqId}/`
      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data/",
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting regularization details:", error);
    throw error;
  }
};
export const getAttendanceRecord = async (orgId, page) => {
  try {
    const response = await HrmsAuth.get(
      `/employees/attendance-bulk?organization_id=${orgId}&page=${page}`
      // `/employees/attendance-bulk?organization_id=${orgId}`
      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data/",
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance records:", error);
    throw error;
  }
};
// get export attendance details
export const getExportAttendance = async (orgId) => {
  try {
    HrmsAuth.get(`user-details/download?organization_id=${orgId}`);
  } catch (error) {
    console.log("Error in exporting ", error.message);
  }
};

export const getAttendanceRecordFilter = async (orgId, siteId, page) => {
  try {
    const res = await HrmsAuth.get(
      `/employees/attendance-bulk?organization_id=${orgId}&associated_organization_id=${siteId}&page=${page}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error posting leave category:", error);
    throw error;
  }
};
export const fetchByNumeric = async (orgId, associatedOrgId, numericValue) => {
  try {
    const response = await HrmsAuth.get(
      `/employees/attendance-bulk?organization_id=${orgId}&associated_organization_id=${associatedOrgId}&id=${numericValue}`
    );
    // if (!response.ok) throw new Error("Network response was not ok");
    return response.data;
  } catch (error) {
    console.error("Error in fetchByNumeric:", error);
    throw error;
  }
};

export const fetchSiteDashboard = async (siteId) => {
  try {
    const res = await HrmsAuth.get(
      `/associated/?associated_organization_id=${siteId}`
    );
    return res.data;
  } catch (error) {
    console.log("Error in fetching fetchSiteDashboard:", error);
    throw error;
  }
};

export const fetchByAssociatedOrganization = async (
  orgId,
  associatedOrgValue
) => {
  try {
    const response = await HrmsAuth.get(
      `/employees/attendance-bulk?organization_id=${orgId}&associated_organization_id=${associatedOrgValue}`
    );
    // if (!response.ok) throw new Error("Network response was not ok");
    return response.data;
  } catch (error) {
    console.error("Error in fetchByAssociatedOrganization:", error);
    throw error;
  }
};

export const fetchByName = async (orgId, name) => {
  try {
    const response = await HrmsAuth.get(
      `/employees/attendance-bulk?organization_id=${orgId}&name=${encodeURIComponent(
        name
      )}`
    );
    // if (!response.ok) throw new Error("Network response was not ok");
    return response.data;
  } catch (error) {
    console.error("Error in fetchByName:", error);
    throw error;
  }
};

export const fetchById = async (orgId, id) => {
  try {
    const response = await HrmsAuth.get(
      `/employees/attendance-bulk?organization_id=${orgId}&id=${id}`
    );
    // if (!response.ok) throw new Error("Network response was not ok");
    return response.data;
  } catch (error) {
    console.error("Error in fetchById:", error);
    throw error;
  }
};

export const postLeaveCategory = async (data) => {
  try {
    const response = await HrmsAuth.post(`/leave-categories/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting leave category:", error);
    throw error;
  }
};
export const getLeaveCategory = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/leave-categories/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave categories:", error);
    throw error;
  }
};
export const getEmployeeLeave = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/leave-request/?employee_id=${empId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave :", error);
    throw error;
  }
};
export const getLeaveSetting = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/leave-settings/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave settings:", error);
    throw error;
  }
};
export const editLeaveSetting = async (settingId, data) => {
  try {
    const response = await HrmsAuth.put(`/leave-settings/${settingId}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating leave settings:", error);
    throw error;
  }
};
export const postLeaveSetting = async (data) => {
  try {
    const response = await HrmsAuth.post(`/leave-settings/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating leave settings:", error);
    throw error;
  }
};
export const getLeaveCategoryDetails = async (categoryId) => {
  try {
    const response = await HrmsAuth.get(`/leave-categories/${categoryId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting leave category:", error);
    throw error;
  }
};
export const editLeaveCategoryDetails = async (categoryId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/leave-categories/${categoryId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating leave category:", error);
    throw error;
  }
};
export const deleteLeaveCategory = async (deleteId) => {
  try {
    const response = await HrmsAuth.delete(`/leave-categories/${deleteId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting leave category:", error);
    throw error;
  }
};

export const getLeaveApplications = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/leave-request/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave applications:", error);
    throw error;
  }
};
export const postSingleLeaveApplication = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/leave-request/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting leave applications:", error);
    throw error;
  }
};
export const postMultipleLeaveApplication = async (data) => {
  try {
    const response = await HrmsAuth.post(`/leave-requests/bulk/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting leave applications:", error);
    throw error;
  }
};
export const approveRejectMultipleRequest = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/leave-requests/approve-pending/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error post request action:", error);
    throw error;
  }
};
export const getLeaveApplicationDetails = async (applicationId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/leave-request/${applicationId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave applications:", error);
    throw error;
  }
};
export const editLeaveApplicationDetails = async (applicationId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee/leave-request/${applicationId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave applications:", error);
    throw error;
  }
};
export const getHRMSEmployeeID = async (vibeID) => {
  try {
    const response = await HrmsAuth.get(
      `/vibe-id/employee/?vibe_id=${vibeID}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee id:", error);
    throw error;
  }
};
export const deleteLeaveApplication = async (applicationId) => {
  try {
    const response = await HrmsAuth.delete(
      `/employee/leave-request/${applicationId}/`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting leave applications:", error);
    throw error;
  }
};
export const postLeaveApplicationApproval = async (applicationId, data) => {
  try {
    const response = await HrmsAuth.post(
      `/leave/requests/status/${applicationId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting leave approval:", error);
    throw error;
  }
};
export const getEmployeeEmploymentDetails = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employment-information/?employee_id=${empId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employment details:", error);
    throw error;
  }
};
export const editEmployeeEmploymentDetails = async (employmentId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employment-information/${employmentId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employment details:", error);
    throw error;
  }
};
// Holidays
export const GetHrmsHolidayDetails = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/company-holidays?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting The hrms Holdays", error);
    throw error;
  }
};

export const AddHolidaysDetails = async (data) => {
  try {
    const response = await HrmsAuth.post(
      "/organization/company-holidays/",
      data
    );
    return response.data;
  } catch (error) {
    console.log("Error Adding The holidays", error);
    throw error;
  }
};

export const GetHrmsHolidayDetailsId = async (id) => {
  try {
    const response = await HrmsAuth.get(`/organization/company-holidays/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error Getting holidays on the basis of id", error);
    throw error;
  }
};

export const UpdateHolidaysDetails = async (id, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/company-holidays/${id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.log("Error in updating the holidays", error);
    throw error;
  }
};

export const handleDeletHoliday = async (Faid) => {
  try {
    const response = await HrmsAuth.delete(
      `/organization/company-holidays/${Faid}/`
    );
    return response.data;
  } catch (error) {
    console.log("Error Deleting Holidays", error);
    throw error;
  }
};

// payroll
export const getHrmsPayrollSlipDetails = async (templateId) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-template-organization/${templateId}`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting the Ctc Structure details", error);
    throw error;
  }
};

export const getPayrollGeneralSetting = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/general-settings/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting payroll general setting:", error);
    throw error;
  }
};
export const editPayrollGeneralSetting = async (payrollId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/payroll/general-settings/${payrollId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payroll general setting:", error);
    throw error;
  }
};
export const getPayrollGratuity = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/gratuity-settings/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting payroll gratuity:", error);
    throw error;
  }
};
export const editPayrollGratuity = async (gratuityId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/payroll/gratuity-settings/${gratuityId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payroll gratuity:", error);
    throw error;
  }
};
export const getFixedAllowance = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/allowance/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payroll gratuity:", error);
    throw error;
  }
};
export const postFixedAllowance = async (data) => {
  try {
    const response = await HrmsAuth.post(`/payroll/allowance/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating payroll gratuity:", error);
    throw error;
  }
};
export const deleteFixedAllowance = async (FAid) => {
  try {
    const response = await HrmsAuth.delete(`/payroll/allowance/${FAid}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting Fixed Allowance:", error);
    throw error;
  }
};
export const getFixedAllowanceDetails = async (FAid) => {
  try {
    const response = await HrmsAuth.get(`/payroll/allowance/${FAid}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting Fixed Allowance:", error);
    throw error;
  }
};
export const editFixedAllowanceDetails = async (FAid, data) => {
  try {
    const response = await HrmsAuth.put(`/payroll/allowance/${FAid}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating Fixed Allowance:", error);
    throw error;
  }
};
// fixed  Hrms allowance
export const getHrmsFilteredAllowance = async (
  org_id,
  type,
  pageNumber,
  search
) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-components/?organization_id=${org_id}&component_type=${type}&page=${pageNumber}&search=${search}`
    );
    return response.data;
  } catch (error) {
    console.log("Error getting  Allowance:", error);
    throw error;
  }
};
export const getHrmsFixedAllowance = async (org_id) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-components/?organization_id=${org_id}`
    );
    return response.data;
  } catch (error) {
    console.log("Error getting  Allowance:", error);
    throw error;
  }
};

export const postHrmsFixedAllowance = async (data) => {
  try {
    const response = await HrmsAuth.post("/ctc-components/", data);
    return response.data;
  } catch (error) {
    console.log("Error Adding  Allowance", error);
    throw error;
  }
};

export const getHrmsFixedAllowanceDetailsId = async (FAid) => {
  try {
    const response = await HrmsAuth.get(`/ctc-components/${FAid}/`);
    return response.data;
  } catch (error) {
    console.log("Error Getting Allowance on bases of id ", error);
    throw error;
  }
};
export const editHrmsFixedAllowanceDetails = async (data, FAid) => {
  try {
    const response = await HrmsAuth.patch(`/ctc-components/${FAid}/`, data);
    return response.data;
  } catch (error) {
    console.log("Error Editing Allowance", error);
    throw error;
  }
};
export const deleteHrmsFixedAllowance = async (FAid) => {
  try {
    const response = await HrmsAuth.delete(`/ctc-components/${FAid}/`);
    return response.data;
  } catch (error) {
    console.log("Error Deleting Allowance", error);
    throw error;
  }
};
// payroll data
export const getHrmsPayrolldetails = async (empid) => {
  try {
    const response = await HrmsAuth.get(
      `/payrolls/?employee_id=${empid}&status=pending`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting the payroll details", error);
    throw error;
  }
};

export const getCtcProfile = async (empId) => {
  try {
    const response = await HrmsAuth.get(`/ctc-profiles/?employee_id=${empId}`);
    return response.data;
  } catch (error) {
    console.log("Error Getting the ctc profile details", error);
    throw error;
  }
};
export const updateCtcProfile = async (profileId, data) => {
  try {
    const response = await HrmsAuth.patch(`/ctc-profiles/${profileId}/`, data);
    return response.data;
  } catch (error) {
    console.log("Error updating the ctc profile details", error);
    throw error;
  }
};

export const deleteCtcProfile = async (FDid) => {
  try {
    const response = await HrmsAuth.delete(`ctc-profiles/${FDid}/`);
    return response.data;
  } catch (error) {
    console.log("Error Deleting the ctc Profile details", error);
    throw error;
  }
};

// fixed hrms deduction
export const getHrmsFilteredDeduction = async (org_id, type, page, search) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-deductions/?organization_id=${org_id}&deduction_type=${type}&page=${page}&search=${search}`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting deduction", error);
    throw error;
  }
};
export const getHrmsFixedDeduction = async (org_id) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-deductions/?organization_id=${org_id}`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting deduction", error);
    throw error;
  }
};
export const deleteHrmsFixedDeduction = async (FDid) => {
  try {
    const response = await HrmsAuth.delete(`/ctc-deductions/${FDid}/`);
    return response.data;
  } catch (error) {
    console.log("Error Delliting selected Deduction", error);
    throw error;
  }
};

export const postHrmsFixedDeduction = async (data) => {
  try {
    const response = await HrmsAuth.post("/ctc-deductions/", data);
    return response.data;
  } catch (error) {
    console.log("Error in adding the fixed deduction", error);
    throw error;
  }
};
export const getHrmsFixedDeductionDetailsId = async (FDid) => {
  try {
    const response = await HrmsAuth.get(`/ctc-deductions/${FDid}/`);
    return response.data;
  } catch (error) {
    console.log("Error getting the fixed deduction on id ", error);
    throw error;
  }
};

export const editHrmsFixedDeduction = async (FDid, data) => {
  try {
    const response = await HrmsAuth.patch(`/ctc-deductions/${FDid}/`, data);
    return response.data;
  } catch (error) {
    console.log("error editing the fixed deduction", error);
    throw error;
  }
};

// Hrms New Ctc template
export const createEmployeeProfile = async (data) => {
  try {
    const response = await HrmsAuth.post(`/ctc-profiles/`, data);
    return response.data;
  } catch (error) {
    console.log("Error Creating the employee profile", error);
    throw error;
  }
};
export const getHrmsCtcFiltereTemplate = async (orgId, page, search, site) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-template-organization/?organization_id=${orgId}&page=${page}&search=${search}&associated=${site}`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting The Ctc Template Data", error);
    throw error;
  }
};
export const getHrmsCtcTemplate = async (orgId, siteId) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-template-organization/?organization_id=${orgId}&associated=${siteId}`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting The Ctc Template Data", error);
    throw error;
  }
};
// export const getHrmsCtcTemplate = async(orgId , siteId ) =>{
//   try {
//     const response = await HrmsAuth.get(`/ctc-template-organization/?organization_id=${orgId}&associated=${siteId}`)
//     return response.data
//   } catch (error) {
//     console.log("Error Getting the ctc template" , error)
//     throw error
//   }
// }
export const createHrmsCtcTemplate = async (data) => {
  try {
    const response = await HrmsAuth.post(`/ctc-template-organization/`, data);
    return response.data;
  } catch (error) {
    console.log("Error creating the Ctc Template ", error);
    throw error;
  }
};

export const deleteHrmsCtcTemplate = async (ctc_id) => {
  try {
    const response = await HrmsAuth.delete(
      `/ctc-template-organization/${ctc_id}/`
    );
    return response.data;
  } catch (error) {
    console.log("Error in deleting the Ctc template ", error);
    throw error;
  }
};

export const getHrmsCtcTemplateonId = async (ctc_id) => {
  try {
    const response = await HrmsAuth.get(
      `/ctc-template-organization/${ctc_id}/`
    );
    return response.data;
  } catch (error) {
    console.log("Error Getting Ctc data Id", error);
    throw error;
  }
};

export const updateHrmsCtcTemplate = async (ctc_id, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/ctc-template-organization/${ctc_id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.log("error updating the ctc", error);
    throw error;
  }
};
export const assignHrmsCtcTemplate = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/api/assign-ctc-template/site/`,
      data
    );
    return response.data;
  } catch (error) {
    console.log("error assigning the ctc", error);
    throw error;
  }
};

export const getFixedDeductions = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/deduction/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Fixed deduction:", error);
    throw error;
  }
};
export const postFixedDeductions = async (data) => {
  try {
    const response = await HrmsAuth.post(`/payroll/deduction/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting Fixed deduction:", error);
    throw error;
  }
};
export const deleteFixedDeductions = async (deductionId) => {
  try {
    const response = await HrmsAuth.delete(
      `/payroll/deduction/${deductionId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting Fixed deduction:", error);
    throw error;
  }
};
export const getFixedDeductionDetails = async (deductionId) => {
  try {
    const response = await HrmsAuth.get(`/payroll/deduction/${deductionId}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting Fixed deduction:", error);
    throw error;
  }
};
export const editFixedDeductionDetails = async (deductionId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/payroll/deduction/${deductionId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Fixed deduction:", error);
    throw error;
  }
};
export const postVariableAllowance = async (data) => {
  try {
    const response = await HrmsAuth.post(`/payroll/variable-allowance/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting variable allowance:", error);
    throw error;
  }
};
export const getVariableAllowance = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/variable-allowance/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting variable allowance:", error);
    throw error;
  }
};
export const deleteVariableAllowance = async (variableId) => {
  try {
    const response = await HrmsAuth.delete(
      `/payroll/variable-allowance/${variableId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting variable allowance:", error);
    throw error;
  }
};
export const postVariableDeduction = async (data) => {
  try {
    const response = await HrmsAuth.post(`/payroll/variable-deduction/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting variable deduction:", error);
    throw error;
  }
};
export const getVariableDeduction = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/variable-deduction/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting variable deduction:", error);
    throw error;
  }
};
export const getOtherBenefits = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/benefit/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting other benefit:", error);
    throw error;
  }
};
export const postOtherBenefits = async (data) => {
  try {
    const response = await HrmsAuth.post(`/payroll/benefit/`, data);
    return response.data;
  } catch (error) {
    console.error("Error getting other benefit:", error);
    throw error;
  }
};
export const deleteOtherBenefits = async (benefitId) => {
  try {
    const response = await HrmsAuth.delete(`/payroll/benefit/${benefitId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting other benefit:", error);
    throw error;
  }
};
export const getOtherBenefitDetails = async (benefitId) => {
  try {
    const response = await HrmsAuth.get(`/payroll/benefit/${benefitId}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting other benefit:", error);
    throw error;
  }
};
export const editOtherBenefitDetails = async (benefitId, data) => {
  try {
    const response = await HrmsAuth.put(`/payroll/benefit/${benefitId}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating other benefit:", error);
    throw error;
  }
};
export const getPayrollLoanCategory = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/loan-category/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting loan category:", error);
    throw error;
  }
};
export const deletePayrollLoanCategory = async (CatId) => {
  try {
    const response = await HrmsAuth.delete(`/payroll/loan-category/${CatId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting loan category:", error);
    throw error;
  }
};
export const postPayrollLoanCategory = async (data) => {
  try {
    const response = await HrmsAuth.post(`/payroll/loan-category/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting loan category:", error);
    throw error;
  }
};
export const getPayrollPaySetting = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/payslip-settings/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting payslip setting:", error);
    throw error;
  }
};
export const editPayrollPaySetting = async (paySlipId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/payroll/payslip-settings/${paySlipId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payslip setting:", error);
    throw error;
  }
};
export const getLeaveEncashment = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/leave-encashment-recovery/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave encashment setting:", error);
    throw error;
  }
};
export const editLeaveEncashment = async (enCashId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/payroll/leave-encashment-recovery/${enCashId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating encashment setting:", error);
    throw error;
  }
};
export const getNoticePeriodRecovery = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/notice-period-recovery/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave recovery:", error);
    throw error;
  }
};
export const editNoticePeriodRecovery = async (noticeId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/payroll/notice-period-recovery/${noticeId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error getting leave recovery:", error);
    throw error;
  }
};
export const getInvestmentSetting = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/investment-settings/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting investment setting:", error);
    throw error;
  }
};
export const editInvestmentSetting = async (invId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/investment-settings/${invId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error editing investment setting:", error);
    throw error;
  }
};

// Roaster
export const fetchAllRoster = async (orgId) => {
  try {
    const res = await HrmsAuth.get(
      `/roster/roster-shift/?organization_id=${orgId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error getting roster shift:", error);
    throw error;
  }
};
export const fetchByRoasterName = async (orgId, name) => {
  try {
    const response = await HrmsAuth.get(
      `roster/roster-shift/?organization_id=${orgId}&name=${name}`
    );
    // if (!response.ok) throw new Error("Network response was not ok");
    return response.data;
  } catch (error) {
    console.error("Error in fetchByName:", error);
    throw error;
  }
};

export const fetchRoasterBySite = async (orgId, siteId, date) => {
  try {
    const res = await HrmsAuth.get(
      `/roster/roster-shift/?organization_id=${orgId}&associated_organization_id=${siteId}&date=${date}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting roster shift:", error);
    throw error;
  }
};

export const getRosterShift = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/roster/shift-master-data/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting roster shift:", error);
    throw error;
  }
};
export const deleteRosterShift = async (shiftId) => {
  try {
    const response = await HrmsAuth.delete(
      `/roster/shift-master-data/${shiftId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting roster shift:", error);
    throw error;
  }
};
export const postRosterShift = async (data) => {
  try {
    const response = await HrmsAuth.post(`/roster/shift-master-data/`, data);
    return response.data;
  } catch (error) {
    console.error("Error post roster shift:", error);
    throw error;
  }
};
export const postRosterAssign = async (data) => {
  try {
    const response = await HrmsAuth.post(`/roster/roster-shift/`, data);
    return response.data;
  } catch (error) {
    console.error("Error post roster shift:", error);
    throw error;
  }
};
export const postRosterAssignBulk = async (data) => {
  try {
    const response = await HrmsAuth.post(`/roster/assign-shift-all/`, data);
    return response.data;
  } catch (error) {
    console.error("Error post roster shift:", error);
    throw error;
  }
};

export const getRosterShiftDetails = async (shiftId) => {
  try {
    const response = await HrmsAuth.get(
      `/roster/shift-master-data/${shiftId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting roster shift:", error);
    throw error;
  }
};
export const editRosterShiftDetails = async (shiftId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/roster/shift-master-data/${shiftId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating roster shift:", error);
    throw error;
  }
};
export const getRosterRecords = async (orgId, page) => {
  try {
    const response = await HrmsAuth.get(
      `/roster/roster-shift-dashboard/?organization_id=${orgId}&page=${page}`
      // `/roster-shift-list/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting roster records:", error);
    throw error;
  }
};
export const getRosterRecordsFilter = async (orgId, siteId, page) => {
  try {
    const response = await HrmsAuth.get(
      `/roster/roster-shift-dashboard/?organization_id=${orgId}&associated_organization_id=${siteId}&page=${page}`
      // `/roster-shift-list/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting roster records:", error);
    throw error;
  }
};
export const getRosterRecordDetails = async (shiftId) => {
  try {
    const response = await HrmsAuth.get(`/roster/roster-shift/${shiftId}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting roster records:", error);
    throw error;
  }
};
export const editRosterRecord = async (data) => {
  try {
    const response = await HrmsAuth.put(`/roster/roster-shift/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating roster records:", error);
    throw error;
  }
};
export const editRosterAssign = async (shiftId, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/roster/roster-shift/${shiftId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating roster records:", error);
    throw error;
  }
};
export const deleteRosterRecord = async (shiftId) => {
  try {
    const response = await HrmsAuth.delete(`/roster/roster-shift/${shiftId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting roster records:", error);
    throw error;
  }
};
export const postRosterRecord = async (data) => {
  try {
    const response = await HrmsAuth.post(`/roster/roster-shift/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting roster records:", error);
    throw error;
  }
};

// attendance settings
//
export const getAttendanceGeneralSetting = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/attendance/attendance-general-settings/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance general setting:", error);
    throw error;
  }
};
export const editAttendanceGeneralSetting = async (settingId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/attendance/attendance-general-settings/${settingId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attendance general setting:", error);
    throw error;
  }
};
export const getAttendanceRegularization = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/attendance/attendance-regularization-settings/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance regularization:", error);
    throw error;
  }
};
export const postAttendanceRegularization = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/attendance/attendance-regularization-settings/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting attendance regularization:", error);
    throw error;
  }
};
export const approveRejectMultipleRegRequest = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/attendance/regularization-bulk/requests/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting request action:", error);
    throw error;
  }
};
export const getAttendanceRegularizationDetails = async (regReasonId) => {
  try {
    const response = await HrmsAuth.get(
      `/attendance/attendance-regularization-settings/${regReasonId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting attendance regularization:", error);
    throw error;
  }
};
export const deleteAttendanceRegularizationDetails = async (regReasonId) => {
  try {
    const response = await HrmsAuth.delete(
      `/attendance/attendance-regularization-settings/${regReasonId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting attendance regularization:", error);
    throw error;
  }
};
export const editAttendanceRegularizationDetails = async (
  regReasonId,
  data
) => {
  try {
    const response = await HrmsAuth.put(
      `/attendance/attendance-regularization-settings/${regReasonId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attendance regularization:", error);
    throw error;
  }
};
export const getCTCTemplate = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/payroll/ctc-template/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting CTC template:", error);
    throw error;
  }
};
export const postCTCTemplate = async (data) => {
  try {
    const response = await HrmsAuth.post(`/payroll/ctc-template/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting CTC template:", error);
    throw error;
  }
};
export const createCTCTemplate = async (data) => {
  try {
    const response = await HrmsAuth.post(`/template/create/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating CTC template:", error);
    throw error;
  }
};
export const showCTCTemplates = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/template/create/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting CTC template:", error);
    throw error;
  }
};
export const showCTCTemplateDetails = async (tempId) => {
  try {
    const response = await HrmsAuth.get(`/template/create/${tempId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting CTC template:", error);
    throw error;
  }
};
export const editCTCTemplateDetails = async (tempId, data) => {
  try {
    const response = await HrmsAuth.put(`/template/create/${tempId}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error getting CTC template:", error);
    throw error;
  }
};
export const getTaxAndStatSettingByTemplateId = async (templateId) => {
  try {
    const response = await HrmsAuth.get(
      `/TaxAndStatutorySettings/?template_id=${templateId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting tax and stat by template id:", error);
    throw error;
  }
};

export const editCTCTemplate = async (tempId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/payroll/ctc-template/${tempId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating CTC template:", error);
    throw error;
  }
};
export const deleteCTCTemplate = async (tempId) => {
  try {
    const response = await HrmsAuth.delete(`/payroll/ctc-template/${tempId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting CTC template:", error);
    throw error;
  }
};
export const deleteNewCTCTemplate = async (tempId) => {
  try {
    const response = await HrmsAuth.delete(`/template/create/${tempId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting CTC template:", error);
    throw error;
  }
};
export const getFlexiGeneralSettings = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/flexi-benefit/setting/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Flexi general setting:", error);
    throw error;
  }
};
export const editFlexiGeneralSettings = async (genId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/flexi-benefit/setting/${genId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Flexi general setting:", error);
    throw error;
  }
};
export const getFlexiBenefitCategory = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/flexi-benefit/categories/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Flexi benefit category:", error);
    throw error;
  }
};
export const postFlexiBenefitCategory = async (data) => {
  try {
    const response = await HrmsAuth.post(`/flexi-benefit/categories/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting Flexi benefit category:", error);
    throw error;
  }
};
export const getFlexiBenefitCategoryDetails = async (flexiId) => {
  try {
    const response = await HrmsAuth.get(`/flexi-benefit/categories/${flexiId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting Flexi benefit category:", error);
    throw error;
  }
};
export const editFlexiBenefitCategoryDetails = async (flexiId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/flexi-benefit/categories/${flexiId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating Flexi benefit category:", error);
    throw error;
  }
};
export const deleteFlexiBenefitCategory = async (flexiId) => {
  try {
    const response = await HrmsAuth.delete(
      `/flexi-benefit/categories/${flexiId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting Flexi benefit category:", error);
    throw error;
  }
};
export const getPerformanceGoal = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/performance/setting-goal/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting performance goal:", error);
    throw error;
  }
};
export const postPerformanceGoal = async (data) => {
  try {
    const response = await HrmsAuth.post(`/performance/setting-goal/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting performance goal:", error);
    throw error;
  }
};
export const deletePerformanceGoal = async (goalId) => {
  try {
    const response = await HrmsAuth.delete(
      `/performance/setting-goal/${goalId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting performance goal:", error);
    throw error;
  }
};
export const getPerformanceGoalDetails = async (goalId) => {
  try {
    const response = await HrmsAuth.get(`/performance/setting-goal/${goalId}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting performance goal:", error);
    throw error;
  }
};
export const editPerformanceGoalDetails = async (goalId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/performance/setting-goal/${goalId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating performance goal:", error);
    throw error;
  }
};

export const getPerformanceCompetency = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/performance/setting-competency/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting performance competency:", error);
    throw error;
  }
};
export const postPerformanceCompetency = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/performance/setting-competency/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting performance competency:", error);
    throw error;
  }
};
export const deletePerformanceCompetency = async (compId) => {
  try {
    const response = await HrmsAuth.delete(
      `/performance/setting-competency/${compId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting performance competency:", error);
    throw error;
  }
};
export const getPerformanceCompetencyDetails = async (compId) => {
  try {
    const response = await HrmsAuth.get(
      `/performance/setting-competency/${compId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting performance competency:", error);
    throw error;
  }
};
export const editPerformanceCompetencyDetails = async (compId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/performance/setting-competency/${compId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating performance competency:", error);
    throw error;
  }
};
export const getMilestoneType = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/milestone-types/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting milestone type:", error);
    throw error;
  }
};
export const postMilestoneType = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/organization/milestone-types/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting milestone type:", error);
    throw error;
  }
};
export const deleteMilestoneType = async (typeId) => {
  try {
    const response = await HrmsAuth.delete(
      `/organization/milestone-types/${typeId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting milestone type:", error);
    throw error;
  }
};
export const getMilestoneTypeDetails = async (typeId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/milestone-types/${typeId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting milestone type details:", error);
    throw error;
  }
};
export const editMilestoneTypeDetails = async (typeId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/milestone-types/${typeId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error getting milestone type details:", error);
    throw error;
  }
};

export const postCalendarMilestone = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/organization/calendar-milestones/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting milestone :", error);
    throw error;
  }
};
export const getCalendarMilestone = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/calendar-milestones/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting milestone :", error);
    throw error;
  }
};
export const getCalendarMilestoneDetails = async (eventId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/calendar-milestones/${eventId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting milestone :", error);
    throw error;
  }
};
export const editCalendarMilestoneDetails = async (eventId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/organization/calendar-milestones/${eventId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating milestone :", error);
    throw error;
  }
};
export const deleteCalendarMilestone = async (eventId) => {
  try {
    const response = await HrmsAuth.delete(
      `/organization/calendar-milestones/${eventId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error delete milestone :", error);
    throw error;
  }
};
export const postHeadOfCompany = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/organization/head-of-company/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting head of company :", error);
    throw error;
  }
};
export const postSalaryGeneralInfo = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee/salary/general-info/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting general info :", error);
    throw error;
  }
};

export const postTaxStatutory = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee/salary/tax-statutory/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error posting tax statutory :", error);
    throw error;
  }
};

export const getEmployeeSalaryDetails = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/salary/general-info/?employee_id=${empId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee salary :", error);
    throw error;
  }
};

//  change Employee type =
export const ChangeUserType = async () => {
  try {
    const response = await HrmsAuth.patch(``);
  } catch (error) {
    console.log("Error changing user type", error);
    throw error;
  }
};
export const getDataChangeRequest = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/submit-change-request/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting data change request :", error);
    throw error;
  }
};
export const deleteDataChangeRequest = async (requestId) => {
  try {
    const response = await HrmsAuth.delete(
      `/employee/submit-change-request/${requestId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting data change request :", error);
    throw error;
  }
};
export const getDataChangeRequestDetails = async (requestId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/submit-change-request/${requestId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting data change request :", error);
    throw error;
  }
};
export const getUserDetails = async (empId) => {
  try {
    const response = await HrmsAuth.get(`/user-details/?employee_id=${empId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user details :", error);
    throw error;
  }
};
export const getEmployeeAsset = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/assets/?employee_id=${empId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee asset :", error);
    throw error;
  }
};
export const getEmployeeAssetDetails = async (empAssetId) => {
  try {
    const response = await HrmsAuth.get(`/employee/assets/${empAssetId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting employee asset details :", error);
    throw error;
  }
};
export const deleteEmployeeAsset = async (empAssetId) => {
  try {
    const response = await HrmsAuth.delete(`/employee/assets/${empAssetId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee asset details :", error);
    throw error;
  }
};
export const editEmployeeAssetDetails = async (empAssetId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee/assets/${empAssetId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating employee asset details :", error);
    throw error;
  }
};
export const postEmployeeAsset = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/assets/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting employee asset :", error);
    throw error;
  }
};
export const getCompanyAsset = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/company-asset/?employee_id=${empId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting company asset :", error);
    throw error;
  }
};
export const getCompanyAssetDetails = async (comAssetId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/company-asset/${comAssetId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting company asset :", error);
    throw error;
  }
};
export const editCompanyAssetDetails = async (comAssetId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/employee/company-asset/${comAssetId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating company asset :", error);
    throw error;
  }
};
export const deleteCompanyAsset = async (comAssetId) => {
  try {
    const response = await HrmsAuth.delete(
      `/employee/company-asset/${comAssetId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting company asset :", error);
    throw error;
  }
};
export const postCompanyAsset = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/company-asset/`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting company asset :", error);
    throw error;
  }
};
export const getEmployeeDocs = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/document/?employee_id=${empId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee document :", error);
    throw error;
  }
};

export const postEmployeeDocs = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/document/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting employee docs :", error);
    throw error;
  }
};
export const deleteEmployeeDocs = async (docId) => {
  try {
    const response = await HrmsAuth.delete(`/employee/document/${docId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting employee docs :", error);
    throw error;
  }
};
export const deleteEmployeeLetters = async (docId) => {
  try {
    const response = await HrmsAuth.delete(`/employee/letter/${docId}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting employee letters :", error);
    throw error;
  }
};
export const getEmployeeLetters = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/letter/?employee_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee letters :", error);
    throw error;
  }
};
export const postEmployeeLetters = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/letter/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting posting letters :", error);
    throw error;
  }
};

// export const getSiteData = async () =>
//   axiosInstance.get(`/get_user_site.json`, {
//     params: {
//       token: token,
//     },
//   });

// export const siteChange = async (id) =>
//   axiosInstance.get(`/change_site_for_app.json?siteid=${id} `, {
//     params: {
//       token: token,
//     },
//   });
export const getTaxAndStatSetting = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/TaxAndStatutorySettings/master/?organization_id=${orgId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting tax and stat setting :", error);
    throw error;
  }
};
export const postTaxAndStatSetting = async (data) => {
  try {
    const response = await HrmsAuth.post(`/TaxAndStatutorySettings/`, data, {
      // headers: {
      //   "Content-Type": "multipart/form-data/",
      // },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting tax and stat setting :", error);
    throw error;
  }
};
export const getReportingSupervisors = async (deptId, orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/reporting-supervisor/?department_id=${deptId}&organization_id=${orgId}`,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting reporting supervisors :", error);
    throw error;
  }
};

// export const getNotification = async () => {
//   try {
//     const response = await HrmsAuth.get(`/notifications/`, {
//       headers: {
//         "Content-Type": "multipart/form-data/",
//       },
//     });
//     return response.data; // Ensure it returns data
//   } catch (error) {
//     console.error("Error getting notifications:", error);
//     return []; // Return empty array on error
//   }
// };
export const getNotification = async (id) => {
  try {
    const response = await HrmsAuth.get(`/notifications/?employee_id=${id}`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data; // Ensure it returns data
  } catch (error) {
    console.error("Error getting notifications:", error);
    return []; // Return empty array on error
  }
};

export const getClientDashboard = async (id) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-organizations/mutiple-site/?&employee_id=${id}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data; // Ensure it returns data
  } catch (error) {
    console.error("Error getting notifications:", error);
    return []; // Return empty array on error
  }
};
export const getClientDashboardSummary = async (
  empId,
  pageNumber,
  start_date
) => {
  try {
    const response = await HrmsAuth.get(
      `associated-wise/attendance-summary/?employee_id=${empId}&page=${pageNumber}&start_date=${start_date}&end_date=${start_date}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data; // Ensure it returns data
  } catch (error) {
    console.error("Error getting Summary:", error);
    return []; // Return empty array on error
  }
};
export const downloadSummaryData = async (siteId, orgId, start_date) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/attendance-report/download-excel/?start_date=${start_date}&end_date=${start_date}&organization_id=${orgId}&site_id=${siteId}`,
      {
        responseType: "blob", // Important for file download
      }
    );
    return response;
  } catch (error) {
    console.error("Error downloading Summary:", error);
    throw error;
  }
};
export const downloadAllEmployeeData = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/user-details/download?organization_id=${orgId}`,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error("Error downloading allData:", error);
    throw error;
  }
};
export const downloadAllSiteData = async (empId, start_date) => {
  try {
    const response = await HrmsAuth.get(
      `/site-admin/attendance-all/employee-excel/?employee_id=${empId}&date=${start_date}`,
      {
        responseType: "blob", // Important for file download
      }
    );
    return response;
  } catch (error) {
    console.error("Error downloading Summary:", error);
    throw error;
  }
};
// new api
export const getAllSitesAttendance = async (empId, date, page, status) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-organizations/mutiple-site-new/?employee_id=${empId}&date=${date}&&page=${page}&status=${status}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error getting all sites data:", error);
    throw error;
  }
};
export const getSiteWiseAttendanceData = async (siteId, date, page, status) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-wise/attendance-new/${siteId}/?start_date=${date}&end_date=${date}&page=${page}&status=${status}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error getting site wise data:", error);
    throw error;
  }
};
// new api
export const getAssociatedOrgDash = async (empId, date) => {
  try {
    const res = await HrmsAuth.get(
      `associated-organization-dashboard/mutiple-site/?employee_id=${empId}&start_date=${date}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log(
      "Error fetching the associated organization dashboard :",
      error
    );
  }
};

export const getClientRosterShift = async (orgId) => {
  try {
    const res = await HrmsAuth.get(
      `roster/roster-shift/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log(
      "Error fetching the associated organization dashboard :",
      error
    );
  }
};

export const updateNotificationStatus = async (notificationId) => {
  try {
    const response = await HrmsAuth.patch(`/notifications/${notificationId}/`, {
      is_read: true,
    });
    console.log("Notification updated:", response.data); // Log after getting the response
    return response.data;
  } catch (error) {
    console.error(
      "Error updating notification:",
      error.response ? error.response.data : error
    );
  }
};

export const getTotalHRMSEmployeeCount = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/count-of-employee/?organization_id=${orgId}`,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee count :", error);
    throw error;
  }
};
export const getAllDepartmentCount = async (orgId) => {
  try {
    const res = await HrmsAuth.get(
      `/associated/?associated_organization_id=${orgId}&department_id=all`
    );
    return res.data;
  } catch (error) {
    console.log("Error getting department count :", error);
  }
};
export const getDepartmentCount = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/${orgId}/departments/employee-count/`,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting department count :", error);
    throw error;
  }
};
export const getLocationCount = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/${orgId}/location/employee-count`,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting location count :", error);
    throw error;
  }
};
export const getGenderCount = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/${orgId}/gender/employee-count/`,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting gender count :", error);
    throw error;
  }
};
export const getDeviceRegistrationRequests = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/device-registration/?organization_id=${orgId}`,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting device registration request :", error);
    throw error;
  }
};
export const postRegistrationRequestApproval = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/device-registration/update-status/`,
      data,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting device registration approval :", error);
    throw error;
  }
};
export const getRegistrationDetails = async (reqId) => {
  try {
    const response = await HrmsAuth.get(`/device-registration/${reqId}`, {
      // headers: {
      //   "Content-Type": "multipart/form-data/",
      // },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting device registration approval :", error);
    throw error;
  }
};
export const getResignations = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/api/employee/resignation/?organization_id=${orgId}`,
      {
        // headers: {
        //   "Content-Type": "multipart/form-data/",
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting resignation :", error);
    throw error;
  }
};
export const getResignationsDetails = async (regId) => {
  try {
    const response = await HrmsAuth.get(`/api/employee/resignation/${regId}`, {
      // headers: {
      //   "Content-Type": "multipart/form-data/",
      // },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting resignation :", error);
    throw error;
  }
};
export const postResignations = async (data) => {
  try {
    const response = await HrmsAuth.post(`/api/employee/resignation/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting resignation :", error);
    throw error;
  }
};
export const ResignationApproval = async (regId, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/api/employee/resignation/${regId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Posting resignation approval:", error);
    throw error;
  }
};
export const putAdditionalResignationDetails = async (resignationId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/api/admin/resignation/${resignationId}/`,
      data
      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data/",
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting resignation :", error);
    throw error;
  }
};
export const getAssociatedSites = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting associated sites :", error);
    throw error;
  }
};
// get associated sites
export const getAvailableSites = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated/?organization_id=${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available sites:", error);
    throw error;
  }
};

export const getEmployeeAssociations = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-organization/?employee_id=${empId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching employee associations:", error);
    throw error;
  }
};
// Hrms update employee password
export const changeEmployeePassword = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/password-reset/`, data);
    return response.data;
  } catch (error) {
    console.log("Error in updating the employee password", error);
    throw error;
  }
};
export const generateSiteWiseSlip = async (data) => {
  try {
    const response = await HrmsAuth.post(`/api/generate-payroll/site/`, data);
    return response.data;
  } catch (error) {
    console.log("Error in generating slips", error);
    throw error;
  }
};
export const getSiteWiseSalarySlip = async (
  siteId,
  month,
  year,
  status,
  search,
  page
) => {
  try {
    const response = await HrmsAuth.get(
      `/api/payroll/site-wise/${siteId}/?month=${month}&year=${year}&status=${status}&search=${search}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.log("Error in getting slips", error);
    throw error;
  }
};
export const updatePaymentStatus = async (payrollId, data) => {
  try {
    const response = await HrmsAuth.patch(`/payrolls/${payrollId}/`, data);
    return response.data;
  } catch (error) {
    console.log("Error in updating slips", error);
    throw error;
  }
};
export const updateBulkPaymentStatus = async (data) => {
  try {
    const response = await HrmsAuth.patch(
      `/api/payroll/site-wise/update-payment/`,
      data
    );
    return response.data;
  } catch (error) {
    console.log("Error in updating slips", error);
    throw error;
  }
};

export const EmployeeHrmsLogs = async (orgId, empId) => {
  try {
    const response = await HrmsAuth.get(
      `/password-reset-history/?organization_id=${orgId}&employee_id=${empId}`
    );
    return response.data;
  } catch (error) {
    console.log("Error in getting employee logs", error);
    throw error;
  }
};
export const updateEmployeeAssociations = async (associationId, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/associated-organization/${associationId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating associations:", error);
    throw error;
  }
};

export const getTotalAttendance = async (empId, date) => {
  try {
    const response = await HrmsAuth.get(
      `associated-organization-dashboard/mutiple-site/?employee_id=${empId}&start_date=${date}`
    );
    return response.data;
  } catch (error) {
    console.log(
      "error fetching total attendance site wise using empId and date:",
      error
    );
    throw error;
  }
};

export const getAssociatedSite = async (id) => {
  try {
    const res = await HrmsAuth.get(`/associated/?site_id=${id}`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return res.data; // Ensure it returns data
  } catch (error) {
    console.error("Error getting notifications:", error);
    return []; // Return empty array on error
  }
};
export const getAssociatedSiteOnly = async (id) => {
  try {
    const res = await HrmsAuth.get(`/associated/${id}`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return res.data; // Ensure it returns data
  } catch (error) {
    console.error("Error getting notifications:", error);
    return []; // Return empty array on error
  }
};

export const postAssociatedSites = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/associated/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting associated sites :", error);
    throw error;
  }
};
export const getEmployeeAssociatedSites = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated/?employee_id=${empId}`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting associated sites :", error);
    throw error;
  }
};
export const getAssociatedSiteDetails = async (siteId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated/${siteId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting associated sites :", error);
    throw error;
  }
};
export const putAssociatedSiteDetails = async (siteId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/associated/${siteId}/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error update associated sites :", error);
    throw error;
  }
};
export const getEmployeeJobInfo = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-organization/?employee_id=${empId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting job info :", error);
    throw error;
  }
};
export const getEmployeeJobInfoDetails = async (infoId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-organization/${infoId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting job info :", error);
    throw error;
  }
};
export const putEmployeeJobInfoDetails = async (infoId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/associated-organization/${infoId}/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job info :", error);
    throw error;
  }
};
export const postEmployeeJobInfo = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/associated-organization/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting job info :", error);
    throw error;
  }
};
export const getHrmsUserRole = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/user-type/?organization_id=${orgId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting user roles :", error);
    throw error;
  }
};
export const getHrmsUserRoleDetails = async (roleId) => {
  try {
    const response = await HrmsAuth.get(
      `/user-type/${roleId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting user roles :", error);
    throw error;
  }
};
export const putHrmsUserRoleDetails = async (roleId, data) => {
  try {
    const response = await HrmsAuth.put(
      `/user-type/${roleId}`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting user roles :", error);
    throw error;
  }
};
export const postHrmsUserRole = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/user-type/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting user roles :", error);
    throw error;
  }
};
export const getOrganizationTreeChart = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/organization/tree/?organization_id=${orgId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting organization tree", error);
    throw error;
  }
};
export const getApprovalAuthorities = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `/approver-settings/?organization_id=${orgId}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting approval authorities", error);
    throw error;
  }
};
export const postApprovalAuthorities = async (data) => {
  try {
    const response = await HrmsAuth.post(`/approver-settings/`, data);
    return response.data;
  } catch (error) {
    console.error("Error getting approval authorities", error);
    throw error;
  }
};
export const editApprovalAuthoritiesStatus = async (approverID, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/approver-settings/${approverID}/`,
      data

      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data/",
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting approval authorities", error);
    throw error;
  }
};
export const getApprovalAuthoritiesDetail = async (approverId) => {
  try {
    const response = await HrmsAuth.get(
      `/approver-settings/?approver_id=${approverId}`
      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data/",
      //   },
      // }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting approval authorities details", error);
    throw error;
  }
};
export const postCTCComponent = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/ctc/components/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting CTC component", error);
    throw error;
  }
};
// change password of single employee

export const postRegularizationRequest = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/attendance/regularization/requests/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting regularization request", error);
    throw error;
  }
};
export const getSiteWiseEmployee = async (orgId, siteId) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-organization/?organization_id=${orgId}&site_id=${siteId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting site employee", error);
    throw error;
  }
};

export const getFullUser = async (orgId) => {
  try {
    const res = await HrmsAuth.get(
      `/user-details/download?associated_organization_id=${orgId}`,
      {
        params: {
          token: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Error fetching the organizational level user detail", error);
    throw error;
  }
};

export const getSiteWiseUserDetails = async (siteId) => {
  try {
    const res = await HrmsAuth.get(
      `/user-details/download?associated_organization_id=${siteId}`,
      {
        params: {
          token: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Error fetching the organizational level user detail", error);
    throw error;
  }
};

export const markEmployeeAttendance = async (data) => {
  try {
    const response = await HrmsAuth.post(`/employee/attendance/`, data, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting employee attendance", error);
    throw error;
  }
};
export const getEmployeeAttendanceOfMonth = async (
  empId,
  startDate,
  endDate
) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/attendance/datewise/list/?employee_id=${empId}&start_date=${startDate}&end_date=${endDate}`,
      // `/employee/attendance/?employee_id=${empId}&start_date=${startDate}&end_date=${endDate}`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee attendance", error);
    throw error;
  }
};
export const getEmployeeAttendanceOfToday = async (
  empId,
  startDate,
  endDate
) => {
  try {
    const response = await HrmsAuth.get(
      `/employee/attendance/?employee_id=${empId}&start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          "Content-Type": "application/json", // Fixed incorrect content type
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee attendance of today", error);
    throw error;
  }
};
export const getSiteWiseAttendance = async (siteId, date) => {
  try {
    const response = await HrmsAuth.get(
      `associated-wise/attendance/${siteId}?start_date=${date}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    // console.log(response.data)//
    return response.data;
  } catch (error) {
    console.error("Error getting employee attendance of today", error);
    throw error;
  }
};
export const getCountOfClientDashboard = async (empId, startDate) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-organization-dashboard/attendance-count/?employee_id=${empId}&start_date=${startDate}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting the total counts", error);
    throw error;
  }
};
// export const getEmployeeAttendanceDetails = async (siteId ,  ) =>{
//   try {
//     const response = await
//   } catch (error) {
//     console.log("Error getting the employee attendance report",error)
//     throw error
//   }
// }
export const getAssocaitedSitesAttendance = async (
  siteId,
  startDate,
  endDate
) => {
  try {
    const response = await HrmsAuth.get(
      `/associated-wise/attendance/${siteId}/?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error getting the total counts", error);
    throw error;
  }
};
export const getEmployeeRoster = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/roster/roster-shift/?employee_id=${empId}`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting employee roster", error);
    throw error;
  }
};
export const getApprovalNotifications = async (approverId) => {
  try {
    const response = await HrmsAuth.get(
      `/approval-notifications/approver/${approverId}/`,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting new hires", error);
    throw error;
  }
};
export const postApproveOrRejectEmployee = async (notificationId, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/approve-reject/${notificationId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error granting approval", error);
    throw error;
  }
};
export const getApprovedEmployees = async (approverId) => {
  try {
    const response = await HrmsAuth.get(
      `approval/approve-list/${approverId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error getting approved employees", error);
    throw error;
  }
};
export const hrmsEmployeeLogin = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee-login/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting request", error);
    throw error;
  }
};
export const postUniformRequest = async (data) => {
  try {
    const response = await HrmsAuth.post(
      `/employee-uniform/request/`,
      data,

      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting request", error);
    throw error;
  }
};
export const getUniformRequest = async (orgId) => {
  try {
    const response = await HrmsAuth.get(
      `employee-uniform/request/?organization_id=${orgId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting info", error);
    throw error;
  }
};
export const getUniformRequestDetails = async (reqID) => {
  try {
    const response = await HrmsAuth.get(`employee-uniform/request/${reqID}/`, {
      headers: {
        "Content-Type": "multipart/form-data/",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting info", error);
    throw error;
  }
};
export const postUniformApproval = async (approvalId, data) => {
  try {
    const response = await HrmsAuth.patch(
      `/employee-uniform/request/${approvalId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting approvalId", error);
    throw error;
  }
};
export const getEmployeeEsic = async (empId) => {
  try {
    const response = await HrmsAuth.get(
      `/esic/create/?employee_id=${empId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Employee Esic card", error);
    throw error;
  }
};

export const getFamilyMember = async (id) => {
  try {
    const response = await HrmsAuth.get(
      `/esic-family-members/?employee_id=${id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Employee family members", error);
    throw error;
  }
};

export const postEsicCard = async (empId, data) => {
  try {
    const response = await HrmsAuth.post(
      `/esic/create/?employee_id=${empId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data/",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting request", error);
    throw error;
  }
};

export const postFamilyEsic = async (data) => {
  try {
    console.log(data);
    const { employee: id, ...formData } = data; // Extract `id` for the URL
    const response = await HrmsAuth.post(
      `/esic-family-members/?organization_id=${id}`, // Use `id` in the URL
      formData, // Send remaining data as the payload
      {
        headers: {
          "Content-Type": "multipart/form-data", // Correct Content-Type
        },
      }
    );
    return response.data; // Return the server response
  } catch (error) {
    console.error(
      "Error posting request:",
      error.response?.data || error.message
    );
    throw error; // Re-throw the error for further handling
  }
};

// site id
export const getSiteData = async () =>
  axiosInstance.get(`/get_user_site.json`, {
    params: {
      token: token,
    },
  });

export const siteChange = async (id) =>
  axiosInstance.get(`/change_site_for_app.json?siteid=${id} `, {
    params: {
      token: token,
    },
  });

// Forum
export const postForum = async (data) =>
  axiosInstance.post(`/forums.json`, data, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getForum = async () =>
  axiosInstance.get(`/forums.json`, {
    params: {
      token: token,
    },
  });

export const updateForum = async (forumId) =>
  axiosInstance.put(`/forums/${forumId}.json`, {
    params: {
      token: token,
    },
  });

export const deleteForum = async (forumId) =>
  axiosInstance.delete(`/forums/${forumId}.json`, {
    params: {
      token: token,
    },
  });
// mailroom
export const getinbound = async () =>
  axiosInstance.get(`/mail_room_inbounds.json`, {
    params: {
      token: token,
    },
  });

export const getInboundDetail = async (id) =>
  axiosInstance.get(`/mail_room_inbounds/${id}.json`, {
    params: {
      token: token,
    },
  });
export const createInbound = async (data) =>
  axiosInstance.post(`/mail_room_inbounds.json`, data, {
    params: {
      token: token,
    },
  });

export const editInbound = async (forumId, payload) => {
  // const token = getItemInLocalStorage("token"); // Ensure token retrieval is correct
  return axiosInstance.put(`/mail_room_inbounds/${forumId}.json`, payload, {
    params: {
      token: token,
    },
  });
};

export const deleteInbound = async (forumId) =>
  axiosInstance.delete(`/mail_room_inbounds/${forumId}.json`, {
    params: {
      token: token,
    },
  });
export const getoutbound = async () =>
  axiosInstance.get(`/mail_room_outbounds.json`, {
    params: {
      token: token,
    },
  });

export const createOutbound = async (data) =>
  axiosInstance.post(`/mail_room_outbounds.json`, data, {
    params: {
      token: token,
    },
  });

export const getOutboundDetail = async (id) =>
  axiosInstance.get(`/mail_room_outbounds/${id}.json`, {
    params: {
      token: token,
    },
  });

export const editOutbound = async (id, payload) => {
  const token = getItemInLocalStorage("token"); // Ensure token retrieval is correct
  return axiosInstance.put(`/mail_room_outbounds/${id}.json`, payload, {
    params: {
      token: token,
    }, // Ensure the token is included correctly
  });
};

export const deleteOutbound = async (forumId) =>
  axiosInstance.delete(`/mail_room_outbounds/${forumId}.json`, {
    params: {
      token: token,
    },
  });

// Save Forums
export const getSavedForum = async (forumId) => {
  try {
    const response = await axiosInstance.get(
      `/forums/saved_forums.json?token=${token}`
    );
    console.log("API Response:", response.data); // Log API data to verify structure

    if (Array.isArray(response.data)) {
      return response.data; // Return array directly
    } else {
      throw new Error("API response is not an array");
    }
  } catch (error) {
    console.error("Error fetching saved forums:", error.message || error);
    return [];
  }
};

export const PostSavedForum = async (forumId) =>
  axiosInstance.post(`/forums/${forumId}/save_for_later.json?token=${token}`, {
    // params: {
    //   token: token,
    // },
  });

export const unsaveForum = async (forumId) =>
  axiosInstance.delete(`forums/${forumId}/unsave.json?token=${token}`, {
    // params: {
    //   token: token,
    // },
  });

// Report Forum Admin
export const GetAllReportedForum = async () => {
  try {
    const response = await axiosInstance.get(`/admin/forum_reports.json`, {
      params: {
        token: token, // Ensure `token` is defined and valid
      },
    });
    return response.data; // Return the data from the response
  } catch (error) {
    console.error("Error fetching reported forums:", error.message || error);
    throw error; // Propagate the error to the calling function
  }
};

// Report Forum Emp
export const reportForum = async (forumId, requestBody) => {
  const token = localStorage.getItem("token"); // Assuming you are saving the token in localStorage
  return axiosInstance.post(
    `/forums/${forumId}/report.json?token=${token}`,
    requestBody
  );
};

// Forum Hide and Unhide - Admin
export const getHiddenForums = async () =>
  axiosInstance.get(`/forums/visibility_status.json?token=${token}`);

export const hideForum = async (forumId) =>
  axiosInstance.post(
    `/forums/${forumId}/hide.json?token=${token}`
    // {}
  );

export const unhideForum = async (forumId) =>
  axiosInstance.post(`forums/${forumId}/unhide.json?token=${token}`);

// Likes
export const likeForum = async (forumId) => {
  try {
    const res = await axiosInstance.post(
      `forums/${forumId}/toggle_like.json?token=${token}`
    );
    return res.data;
  } catch (error) {
    console.log("Error is occuring :", error.response?.data || error.message);
    throw error;
  }
};

// Comments
export const getComments = async (forumId) => {
  try {
    const response = await axiosInstance.get(
      `/forums/${forumId}/forum_comments.json/`,
      {
        params: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
};

export const addComment = async (forumId, commentText, userId) => {
  try {
    // Create FormData object with the correct parameter structure
    const formData = new FormData();
    formData.append("forum_comment[comment]", commentText);
    // Changed from forum_comments to forum_comment
    formData.append("forum_comment[user_id]", userId);
    // Changed from forum_comments to forum_comment
    const response = await axiosInstance.post(
      `/forums/${forumId}/forum_comments.json`,
      formData,
      {
        params: {
          token: token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting the comment:", error);
    throw error;
  }
};

export const deleteComment = async (forumId, id) =>
  axiosInstance.delete(
    `/forums/${forumId}/forum_comments/${id}.json?token=${token}`
  );

export const updateComment = async (forumId) =>
  axiosInstance.put(`/forums/${forumId}/forum_comments.json`, {
    params: {
      token: token,
    },
  });
//////////////////////////////////////////////////////////////////

export const downloadAsset = async () =>
  axiosInstance.get(`/site_assets/export.xlsx/`, {
    params: {
      token: token,
    },
    responseType: "blob",
  });

export const getBreakdownDownload = async () =>
  axiosInstance.get(`/site_assets/export.xlsx`, {
    params: {
      token: token,
      "q[breakdown_eq]": 1,
    },
    responseType: "blob",
  });
export const getAssetInDownload = async () =>
  axiosInstance.get(`/site_assets/export.xlsx`, {
    params: {
      token: token,
      "q[breakdown_eq]": false,
    },
    responseType: "blob",
  });

export const getScheduledDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      scheduled: true,
    },
    responseType: "blob",
  });

export const getPPMOverDueDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      overdue: true,
    },
    responseType: "blob",
  });

export const getPPMPendingDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      pending: true,
    },
    responseType: "blob",
  });

export const getPPMcompleteDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      complete: true,
    },
    responseType: "blob",
  });

export const getTotalAssetCount = async (ids) =>
  axiosInstance.get(`/site_assets/count.json`, {
    params: {
      token: token,
      site_ids: ids.join(","),
    },
  });

export const getBreakCount = async (ids) =>
  axiosInstance.get(`/site_assets/count.json`, {
    params: {
      token: token,
      "q[breakdown_eq]": true, // add this line to include q[breakdown_eq]
      site_ids: ids.join(","),
    },
  });

export const getInUseAssetBreakDown = async (ids) =>
  axiosInstance.get(`/site_assets/count.json`, {
    params: {
      token: token,
      "q[breakdown_eq]": false, // add this line to include q[breakdown_eq]
      site_ids: ids.join(","),
    },
  });

export const getPPMScheduleCount = async (ids) =>
  axiosInstance.get(`/activities/count.json`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      scheduled: true,
      site_ids: ids.join(","),
    },
  });

export const getPPMOverDueCount = async (ids) =>
  axiosInstance.get(`/activities/count.json`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      overdue: true,
      site_ids: ids.join(","),
    },
  });

export const getPPMpendingCount = async (ids) =>
  axiosInstance.get(`/activities/count.json`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      pending: true,
      site_ids: ids.join(","),
    },
  });
export const getPPMCompleteCount = async (ids) =>
  axiosInstance.get(`/activities/count.json`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "ppm",
      complete: true,
      site_ids: ids.join(","),
    },
  });

export const getRoutineScheduledDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      scheduled: true,
    },
    responseType: "blob",
  });

export const getRoutineOverdueDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      overdue: true,
    },
    responseType: "blob",
  });
export const getRoutineCompleteDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      complete: true,
    },
    responseType: "blob",
  });

export const getRoutinePendingDownload = async () =>
  axiosInstance.get(`/activities/export.xlsx`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      pending: true,
    },
    responseType: "blob",
  });

export const getRoutineScheduledCount = async (ids) =>
  axiosInstance.get(`/activities/count.json`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      scheduled: true,
      site_ids: ids.join(","),
    },
  });
export const getRoutineOverdueCount = async (ids) =>
  axiosInstance.get(`/activities/count.json`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      overdue: true,
      site_ids: ids.join(","),
    },
  });
export const getRoutineCompleteCount = async (ids) =>
  axiosInstance.get(`/activities/count.json?`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      complete: true,
      site_ids: ids.join(","),
    },
  });
export const getRoutinePendingCount = async (ids) =>
  axiosInstance.get(`/activities/count.json`, {
    params: {
      token: token,
      "q[checklist_ctype_eq]": "routine",
      pending: true,
      site_ids: ids.join(","),
    },
  });

export const getFilterData = async (
  catId,
  issueStatId,
  prio_count,
  assign_eq
) =>
  axiosInstance.get(
    `/pms/admin/complaints.json?q[category_type_id_eq]=${catId}&q[issue_status_eq]=${issueStatId}&q[priority_cont]=${prio_count}&q[assigned_to_eq]=${assign_eq}`,
    {
      params: {
        token: token,
      },
    }
  );

export const getComplaintMode = async () =>
  axiosInstance.get(`/complaint_modes.json`, {
    params: {
      token: token,
    },
  });
export const getRestaurtantTableBookings = async () =>
  axiosInstance.get(`/table_bookings.json`, {
    params: {
      token: token,
    },
  });
export const getRestaurtantOrderBookings = async () =>
  axiosInstance.get(`/restaurant_orders.json`, {
    params: {
      token: token,
    },
  });

//Food
export const downloadRestaurtantData = async () =>
  axiosInstance.get(`/food_and_beverages/export.xlsx`, {
    params: {
      token: token,
    },
    responseType: "blob",
  });
export const postRestaurtantMenu = async (data) =>
  axiosInstance.post("/restaurant_menus.json", data, {
    params: {
      token: token,
    },
  });
export const getRestaurtantMenu = async (id) =>
  axiosInstance.get(`/restaurant_menus.json?restaurant_id=${id}`, {
    params: {
      token: token,
    },
  });
export const getRestaurtantMenuDetails = async (id, resid) =>
  axiosInstance.get(`/restaurant_menus/${id}.json?restaurant_id=${resid}`, {
    params: {
      token: token,
    },
  });
export const EditRestaurtantMenuDetails = async (id, resid, data) =>
  axiosInstance.put(
    `/restaurant_menus/${id}.json?restaurant_id=${resid}`,
    data,
    {
      params: {
        token: token,
      },
    }
  );
export const postFB = async (data) =>
  axiosInstance.post("/food_and_beverages.json", data, {
    params: {
      token: token,
    },
  });

export const getFB = async () =>
  axiosInstance.get("/food_and_beverages.json", {
    params: {
      token: token,
    },
  });

export const getFBDetails = async (id) =>
  axiosInstance.get(`/food_and_beverages/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editFB = async (id, data) =>
  axiosInstance.put(`/food_and_beverages/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getFBSubCategories = async () =>
  axiosInstance.get("/get_sub_categories.json", {
    params: {
      token: token,
    },
  });
export const postPantry = async (data) =>
  axiosInstance.post("/pantries.json", data, {
    params: {
      token: token,
    },
  });
export const getPantry = async () =>
  axiosInstance.get("/pantries.json", {
    params: {
      token: token,
    },
  });
export const getPantryDetails = async (id) =>
  axiosInstance.get(`/pantries/${id}.json`, {
    params: {
      token: token,
    },
  });
export const postIncidentTags = async (data) =>
  axiosInstance.post(`/incidence_tags.json`, data, {
    params: {
      token: token,
    },
  });
export const gettIncidentTags = async () =>
  axiosInstance.get(`/incidence_tags.json`, {
    params: {
      token: token,
    },
  });
export const getIncidentTags = async (tagType) =>
  axiosInstance.get(`/incidence_tags.json?q[tag_type_cont]=${tagType}`, {
    params: {
      token: token,
    },
  });

export const getInjured = async (InjuredType) =>
  axiosInstance.get(`/incidence_tags.json?q[tag_type_cont]=${InjuredType}`, {
    params: {
      token: token,
    },
  });

export const postInjured = async (data) =>
  axiosInstance.post(`/incidence_tags.json`, data, {
    params: {
      token: token,
    },
  });

export const getIncidentData = async (id) =>
  axiosInstance.get(`/incidents/${id}.json`, {
    params: {
      token: token,
    },
  });

export const getIncidentSubTags = async (tagType, parentId) =>
  axiosInstance.get(
    `/incidence_tags.json?q[tag_type_cont]=${tagType}&q[parent_id_eq]=${parentId}`,
    {
      params: {
        token: token,
      },
    }
  );
export const getIncidentSubTag = async (parentId) =>
  axiosInstance.get(`/incidence_tags.json?q[parent_id_eq]=${parentId}`, {
    params: {
      token: token,
    },
  });
export const getIncidentTreeNode = async (tagType) =>
  axiosInstance.get(`/incidence_tags/tree_structure.json?tag_type=${tagType}`, {
    params: {
      token: token,
    },
  });
export const deleteIncidentTags = async () =>
  axiosInstance.delete(`/incidence_tags.json`, {
    params: {
      token: token,
    },
  });
export const getIncidentCatDetails = async (id) =>
  axiosInstance.get(`/incidence_tags/${id}.json`, {
    params: {
      token: token,
    },
  });
export const editIncidentCatDetails = async (id, data) =>
  axiosInstance.put(`/incidence_tags/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getIncidents = async () =>
  axiosInstance.get(`/incidents.json`, {
    params: {
      token: token,
    },
  });
export const getIncidentDetails = async (incidentId) =>
  axiosInstance.get(`/incidents/${incidentId}.json`, {
    params: {
      token: token,
    },
  });
export const postIncidents = async (id) =>
  axiosInstance.post(`/incidents.json`, id, {
    params: {
      token: token,
    },
  });
export const postInjurydata = async (data) =>
  axiosInstance.post(`/incident_injuries.json`, data, {
    params: {
      token: token,
    },
  });
export const updateIncidents = async (id, data) =>
  axiosInstance.put(`/incidents/${id}.json`, data, {
    params: {
      token: token,
    },
  });

const defaultIp = getItemInLocalStorage("DEFAULT");
const defaultUsername = getItemInLocalStorage("DeviceUsername");
const defaultPassword = getItemInLocalStorage("DevicePassword");
export const postVisitorInDevice = async (data) => {
  console.log(defaultIp);
  // http://localhost:8080/
  const url = ` http://localhost:8080/${defaultIp}/ISAPI/AccessControl/UserInfo/Record?format=json`;
  // const url = "http://192.168.1.22/ISAPI/AccessControl/UserInfo/Record?format=json";
  const username = defaultUsername;
  const password = defaultPassword;

  const client = new DigestFetch(username, password);

  try {
    const response = await client.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `POST request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
export const postVisitorLogFromDevice = async (data) => {
  console.log(defaultIp);
  // http://localhost:8080/
  const url = ` http://${defaultIp}/ISAPI/AccessControl/AcsEvent?format=json`;
  // const url = "http://192.168.1.22/ISAPI/AccessControl/UserInfo/Record?format=json";
  const username = defaultUsername;
  const password = defaultPassword;
  console.log(username);
  console.log(password);

  const client = new DigestFetch(username, password);

  try {
    const response = await client.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `POST request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const postVisitorLogToBackend = async (data) =>
  axiosInstance.post(`/visitor_device_logs.json`, data, {
    params: {
      token: token,
    },
  });
export const getVisitorLogs = async (visitorId) =>
  axiosInstance.get(`/visitor_device_logs/${visitorId}.json`, {
    params: {
      token: token,
    },
  });
export const getAllVisitorLogs = async () =>
  axiosInstance.get(`/visitor_device_logs.json`, {
    params: {
      token: token,
    },
  });

//
export const postDeviceConfiguration = async (data) =>
  axiosInstance.post(`/hik_devices.json`, data, {
    params: {
      token: token,
    },
  });
export const editDeviceConfiguration = async (id, data) =>
  axiosInstance.put(`/hik_devices/${id}.json`, data, {
    params: {
      token: token,
    },
  });
export const getDeviceConfigurationDetails = async (id) =>
  axiosInstance.get(`/hik_devices/${id}.json`, {
    params: {
      token: token,
    },
  });
export const getDeviceConfiguration = async (siteId) =>
  axiosInstance.get(`/hik_devices/find_by_site/${siteId}.json`, {
    params: {
      token: token,
    },
  });
export const postComplianceTags = async (data) =>
  axiosInstance.post(`/compliance_tags.json`, data, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getComplianceTags = async (tagType) =>
  axiosInstance.get(`/compliance_tags.json?q[tag_type_cont]=${tagType}`, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getComplianceTagDetails = async (catId) =>
  axiosInstance.get(`/compliance_tags/${catId}.json`, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getComplianceTree = async () =>
  axiosInstance.get(
    `/compliance_tags/tree_structure.json?tag_type=complianceCategory`,

    {
      params: {
        token: token,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
export const postComplianceTasks = async (data) =>
  axiosInstance.post(`/compliance_tag_tasks.json`, data, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const postComplianceConfiguration = async (data) =>
  axiosInstance.post(`/compliance_configs.json`, data, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getComplianceConfiguration = async () =>
  axiosInstance.get(`/compliance_configs.json`, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const getComplianceConfigurationDetails = async (complianceId) =>
  axiosInstance.get(`/compliance_configs/${complianceId}.json`, {
    params: {
      token: token,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const postComplianceCategoryConfiguration = async (data) =>
  axiosInstance.post(`/compliance_config_tags.json`, data, {
    params: {
      token: token,
    },
  });

export const getFilteredUsers = async (userType) =>
  axiosInstance.get(`/users.json?q[user_type_eq]=${userType}`, {
    params: {
      token: token,
    },
  });
export const getVendorComplianceList = async (assignedId) =>
  axiosInstance.get(
    `/compliance_trackers.json?q[complicance_config_assign_to_id_eq]=${assignedId}`,
    {
      params: {
        token: token,
      },
    }
  );
export const getComplianceListDetails = async (taskId) =>
  axiosInstance.get(`/compliance_trackers/${taskId}.json`, {
    params: {
      token: token,
    },
  });
export const postComplianceEvidence = async (data) =>
  axiosInstance.post(`/compliance_tracker_tags.json`, data, {
    params: {
      token: token,
    },
  });

export const getReviewerAssignments = async (complianceId, auditorId) =>
  axiosInstance.get(
    `/compliance_trackers/${complianceId}.json?q[compliance_config_reviewer_id_eq]=${auditorId}`,
    {
      params: {
        token: token,
      },
    }
  );

//cam billing
export const getCamBillingData = async () =>
  axiosInstance.get("/cam_bills.json", {
    params: {
      token: token,
    },
  });

export const getCamBillingDownload = async (ids) =>
  axiosInstance.get(`/cam_bills/export.xlsx`, {
    responseType: "blob",
    params: {
      ids: `[${ids}]`, // Adding square brackets around ids
      token: token,
    },
  });

export const gatCamBillFilter = async (
  block,
  floor_name,
  flat,
  status,
  startDate,
  endDate,
  dueDate
) =>
  axiosInstance.get(
    `/cam_bills.json?q[building_id_eq]=${block}&q[floor_id_eq]=${floor_name}&q[unit_id_eq]=${flat}&q[payment_status_eq]=${status}&q[bill_period_start_date_eq]=${startDate}&q[bill_period_end_date_eq]=${endDate}&q[due_date_eq]=${dueDate}`,
    {
      params: {
        token: token,
      },
    }
  );
export const downloadCamBillImport = async () =>
  axiosInstance.get(`/cam_bills/download_sample.xlsx`, {
    params: {
      token: token, // Include the token in the request
    },
    responseType: "blob", // Ensure response is of type `blob`
  });

export const uploadCamBillingImport = async (data) =>
  axiosInstance.post(`/cam_bills/import.json`, data, {
    params: {
      token: token,
    },
  });

export const postCamBilling = async (data) =>
  axiosInstance.post(`/address_setups.json`, data, {
    params: {
      token: token,
    },
  });

export const getAddressSetupDetails = async (id) =>
  axiosInstance.get(`/address_setups/${id}.json`, {
    params: {
      token: token,
    },
  });

export const updateAddressSetupCamBilling = async (data, id) =>
  axiosInstance.put(`/address_setups/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const getAddressSetup = async () =>
  axiosInstance.get("/address_setups.json", {
    params: {
      token: token,
    },
  });
export const postCamBill = async (data) =>
  axiosInstance.post(`/cam_bills.json`, data, {
    params: {
      token: token,
    },
  });

export const getCamBillingDataDetails = async (id) =>
  axiosInstance.get(`/cam_bills/${id}.json`, {
    params: {
      token: token,
    },
  });

export const recallStatus = async (id, data) =>
  axiosInstance.put(`/cam_bills/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const receiptPayment = async (data) =>
  axiosInstance.post(`/payments.json`, data, {
    params: {
      token: token,
    },
  });

export const camBillingStatus = async (id, data) =>
  axiosInstance.put(`/cam_bills/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const downloadReceiptInvoice = async (ids) =>
  axiosInstance.get(`cam_bills/invoice_pdf?id=${ids}`, {
    responseType: "blob",
    params: {
      token: token,
    },
  });

export const getCamBillInvoiceDownload = async (ids) =>
  axiosInstance.get(`/cam_bills/pdf?id=${ids}`, {
    responseType: "blob",
  });

export const getCamLogo = async () =>
  axiosInstance.get(`/get_logo.json?`, {
    params: {
      token: token,
    },
  });

export const postInvoiceReceipt = async (data) =>
  axiosInstance.post(`/invoice_receipts.json`, data, {
    params: {
      token: token,
    },
  });

export const downloadReceiptInvoiceSample = async () =>
  axiosInstance.get(`/invoice_receipts/download_sample.json?`, {
    params: {
      token: token, // Include the token in the request
    },
    responseType: "blob", // Ensure response is of type `blob`
  });

export const uploadCamReceiptImport = async (data) =>
  axiosInstance.post(`/invoice_receipts/import.json`, data, {});

export const gatReceiptInvoiceFilter = async (
  block,
  floor_name,
  flat,
  invoiceNumber,
  receiptNumber,
  receiptDate
) =>
  axiosInstance.get(
    `/invoice_receipts.json?q[building_id_eq]=${block}&q[floor_id_eq]=${floor_name}&q[unit_id_eq]=${flat}&q[invoice_number_eq]=${invoiceNumber}&q[receipt_number_eq]=${receiptNumber}&q[receipt_date_eq]=${receiptDate}`,
    {
      params: {
        token: token,
      },
    }
  );

export const getInvoiceReceipt = async () =>
  axiosInstance.get("/invoice_receipts.json", {
    params: {
      token: token,
    },
  });

export const getReceiptInvoiceCamDownload = async (ids) =>
  axiosInstance.get(`/invoice_receipts/export.xlsx?`, {
    responseType: "blob",
    params: {
      ids: `[${ids}]`, // Adding square brackets around ids
    },
  });

export const getReceiveInvoiceData = async (id) =>
  axiosInstance.get(`/invoice_receipts/${id}.json`, {
    params: {
      token: token,
    },
  });

export const postInvoiceType = async (data) =>
  axiosInstance.post(`/invoice_types.json`, data, {
    params: {
      token: token,
    },
  });

export const getInvoiceTypeDetail = async (id) =>
  axiosInstance.get(`/invoice_types/${id}.json`, {
    params: {
      token: token,
    },
  });

export const putInvoiceType = async (id, data) =>
  axiosInstance.patch(`/invoice_types/${id}.json`, data, {
    params: {
      token: token,
    },
  });

export const deleteAddressSetup = async (id) =>
  axiosInstance.delete(`/address_setups/${id}.json`, {
    params: {
      token: token,
    },
  });

export const getInvoiceTypeSetup = async () =>
  axiosInstance.get("/invoice_types.json", {
    params: {
      token: token,
    },
  });

export const postInvoiceNumber = async (data) =>
  axiosInstance.post(`/invoice_setups.json`, data, {
    params: {
      token: token,
    },
  });

export const postLogoCamBillingSetup = async (data) =>
  axiosInstance.post(`/upload_logo.json`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },

    params: {
      token: token,
    },
  });

export const postReceiptNumber = async (data) =>
  axiosInstance.post(`/receipt_setups.json`, data, {
    params: {
      token: token,
    },
  });
