export const BANK_OPTIONS = [
  { value: "VCB", label: "Vietcombank" },
  { value: "TCB", label: "Techcombank" },
  { value: "BIDV", label: "BIDV" },
  { value: "VTB", label: "VietinBank" },
  { value: "ACB", label: "ACB" },
  { value: "MB", label: "MB Bank" },
  { value: "OCB", label: "OCB — Ngân hàng Phương Đông" },
  { value: "VPB", label: "VPBank" },
  { value: "other", label: "Ngân hàng khác" },
];

export const resolveBankLabel = (bankName) => {
  const found = BANK_OPTIONS.find((b) => b.value === bankName);
  return found ? found.label : bankName;
};
