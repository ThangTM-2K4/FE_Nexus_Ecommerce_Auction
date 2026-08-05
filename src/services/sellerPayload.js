const safeUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && value.startsWith('data:')) return 'uploaded';
  return value;
};

const toSellerTypeEnum = (type) =>
  String(type ?? '').toLowerCase() === 'business'
    ? 'Business'
    : 'Individual';

export const toRegisterBody = (form) => ({
  sellerType: toSellerTypeEnum(form.businessType),
  businessName: form.shopName,
  contactPhoneNumber: form.contactPhone,
  taxCode: form.taxCode,
  businessLicenseUrl: safeUrl(form.businessLicense),
  address: form.pickupAddress,
  bankAccountNumber: form.accountNumber,
  bankName: form.bankName,
  bankAccountHolder: form.accountHolder,
});
