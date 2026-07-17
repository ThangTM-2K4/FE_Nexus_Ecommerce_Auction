export const unwrapData = (payload) => {
  if (payload == null) return null;
  if (typeof payload !== "object") return payload;
  if (payload.data !== undefined) return payload.data;
  if (payload.result !== undefined) return payload.result;
  return payload;
};

export const unwrapPagedList = (payload) => {
  const data = unwrapData(payload);

  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, pageSize: data.length || 20 };
  }

  const items = data?.items ?? data?.results ?? data?.content ?? data?.data ?? [];
  return {
    items: Array.isArray(items) ? items : [],
    total: data?.totalCount ?? data?.total ?? data?.count ?? (Array.isArray(items) ? items.length : 0),
    page: data?.page ?? data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? data?.limit ?? 20,
  };
};

/**
 * Tên field backend (ASP.NET) → nhãn tiếng Việt để báo lỗi cho người dùng đọc hiểu.
 * Backend trả tên field bằng tiếng Anh (VD "EmailOrPhone"), không map thì user
 * đọc không ra là thiếu ô nào.
 */
const FIELD_LABELS = {
  EmailOrPhone: "Email/Số điện thoại",
  Email: "Email",
  NewEmail: "Email mới",
  Password: "Mật khẩu",
  NewPassword: "Mật khẩu mới",
  OldPassword: "Mật khẩu cũ",
  ConfirmPassword: "Xác nhận mật khẩu",
  FullName: "Họ tên",
  PhoneNumber: "Số điện thoại",
  Phone: "Số điện thoại",
  OtpCode: "Mã OTP",
  Address: "Địa chỉ",
  DateOfBirth: "Ngày sinh",
  Gender: "Giới tính",
  IdentityNumber: "Số CCCD/CMND",
  FrontImageUrl: "Ảnh mặt trước CCCD",
  BackImageUrl: "Ảnh mặt sau CCCD",
  BankName: "Tên ngân hàng",
  AccountNumber: "Số tài khoản",
  AccountHolder: "Chủ tài khoản",
  Reason: "Lý do",
};

const labelFor = (field) => FIELD_LABELS[field] || field;

/**
 * Bóc lỗi validation dạng ASP.NET ValidationProblemDetails:
 *   { errors: { "Password": ["The Password field is required."], ... } }
 * Trả về mảng [{ field, label, messages }] hoặc [] nếu không phải dạng này.
 */
export const getApiValidationErrors = (error) => {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return [];

  return Object.entries(errors)
    .filter(([, msgs]) => msgs != null)
    .map(([field, msgs]) => ({
      field,
      label: labelFor(field),
      messages: Array.isArray(msgs) ? msgs : [String(msgs)],
    }));
};

export const getApiErrorMessage = (error, fallback = "Đã xảy ra lỗi, vui lòng thử lại") => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;

  // 400 ValidationProblemDetails: `errors` là OBJECT theo field (không phải mảng)
  // → nói rõ thiếu/sai ô nào thay vì "Request failed with status code 400".
  const fieldErrors = getApiValidationErrors(error);
  if (fieldErrors.length) {
    const parts = fieldErrors.map(({ label, messages }) => {
      const text = messages.join(" ");
      // Lỗi "field is required" thì chỉ cần nêu tên ô cho gọn
      return /is required|bắt buộc/i.test(text) ? label : `${label} (${text})`;
    });
    return `Vui lòng kiểm tra: ${parts.join(", ")}`;
  }

  if (Array.isArray(data?.errors) && data.errors[0]?.message) return data.errors[0].message;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail; // VD 401: "Incorrect login information."
  if (data?.error) return data.error;
  if (data?.title && !/validation errors occurred/i.test(data.title)) return data.title;

  // error.message của axios là "Request failed with status code 400" — vô nghĩa
  // với người dùng, nên chỉ dùng khi nó không phải chuỗi mặc định đó.
  if (error?.message && !/Request failed with status code/i.test(error.message)) {
    return error.message;
  }
  return fallback;
};

