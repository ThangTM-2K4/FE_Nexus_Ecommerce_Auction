import api from "../config/api";
import { extractUploadKey } from "./uploadResponse";

export const uploadBusinessLicense = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/uploads/business-license", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    key: extractUploadKey(res),
    originalFileName: file.name,
    size: file.size,
  };
};
