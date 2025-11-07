export enum VehicleTransmission {
  Automatic = 1,
  Manual = 2,
}

export const VehicleTransmissionLabel: Record<VehicleTransmission, string> = {
  [VehicleTransmission.Automatic]: 'Automatic',
  [VehicleTransmission.Manual]: 'Manual',
};

export enum LicenseType {
  ADI = 1,
  PDI = 2 // add more if needed
}

export const LicenseTypeLabel: Record<LicenseType, string> = {
  [LicenseType.ADI]: 'ADI',
  [LicenseType.PDI]: 'PDI'
};

export const LicenseTypeNameToId: Record<string, LicenseType> = {
  ADI: LicenseType.ADI,
  PDI: LicenseType.PDI
};

export enum VerificationStatus {
  Approved = 1,
  Pending = 2,
  Rejected = 3
}

// rights.constant.ts
export const RIGHTS = {
  VIEW: 'IsView',
  ADD: 'IsAdd',
  EDIT: 'IsEdit',
  DELETE: 'IsDelete',
  APPROVE_REJECT: 'IsApproveReject'
} as const;

export type RightType = keyof typeof RIGHTS;

// menu.constant.ts
export const MENU = {
  DASHBOARD: 1,
  USER_MANAGEMENT: 2,
  INSTRUCTOR_MANAGEMENT: 3,
  STUDENT_MANAGEMENT: 4,
  COUPON_MANAGEMENT: 5,
  ROLE_MANAGEMENT: 7,
  SETTING: 6,
  SLOT_MANAGEMENT: 8,
  BOOKING_MANAGEMENT: 9,
  STRIPE_CONFIGURATION: 10,
} as const;

export enum CouponColor {
  Red = "FF0000",
  Blue = "0000FF",
  Green = "00FF00",
  Yellow = "FFFF00",
  Black = "000000",
  White = "FFFFFF",
  Orange = "FFA500",
  Purple = "800080",
  Pink = "FFC0CB",
  Gray = "808080",
  Brown = "A52A2A",
  Cyan = "00FFFF",
  Magenta = "FF00FF",
  Olive = "808000",
  Gold = "FFD700",
  Indigo = "4B0082",
  LightBlue = "ADD8E6",
  LightCoral = "F08080",
  LightGreen = "90EE90",
  LightGray = "D3D3D3",
  OrangeRed = "FF4500",
  Orchid = "DA70D6",
  LightSeaGreen = "20B2AA",
  MediumSlateBlue = "7B68EE",
  SteelBlue = "4682B4",
  SeaGreen = "2E8B57",
  SlateBlue = "6A5ACD",
  SlateGray = "708090",
  Firebrick = "B22222",
  ForestGreen = "228B22",
  DarkSalmon = "E9967A",
  DarkViolet = "9400D3",
  DeepPink = "FF1493"
}

export type MenuType = keyof typeof MENU;
