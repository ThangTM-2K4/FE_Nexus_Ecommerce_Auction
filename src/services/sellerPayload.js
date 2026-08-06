const normalizeKey = (value) => {
  if (!value) return "";

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const toSellerTypeEnum = (type) =>
  String(type ?? "").toLowerCase() === "business" ? "Business" : "Individual";

export const toRegisterBody = (form) => ({
  sellerType: toSellerTypeEnum(form.businessType),

  businessName: form.shopName,

  contactPhoneNumber: form.contactPhone,

  taxCode: form.taxCode,

  businessLicenseKey: normalizeKey(form.businessLicenseKey),

  address: form.pickupAddress,

  bankAccountNumber: form.accountNumber,

  bankName: form.bankName,

  bankAccountHolder: form.accountHolder,
});
