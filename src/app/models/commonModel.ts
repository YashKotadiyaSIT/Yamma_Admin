export interface ApiResponse {
  forEach(arg0: (item: any) => void): unknown;
  success: boolean;
  message: string;
  data: any;
  TAID?: number;
}
