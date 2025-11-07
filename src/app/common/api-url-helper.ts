import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiUrlHelper {
  public apiUrl = {
    Login: {
      AdminLogin: 'admin/account/login',
      logout: 'admin/account/logout',
      GetOtp: 'admin/account/forget-password',
      VerifyOtp: 'admin/account/verify-otp',
      ResetPassword: 'admin/account/reset-password',
      ChangePassword: 'admin/account/change-password',
      ProfilePicture: 'admin/account/profile',
    },

    Instuctor: {
      InstructorList: 'admin/instructor/list',
      InstuctorDetailsById: 'admin/instructor/detail/{id}',
      InstuctorApproveReject: 'admin/instructor/approve-reject',
      InstuctorActiveInActive: 'admin/instructor/active-inactive',
      UpdateProfile: 'admin/instructor/update-profile',
      UpdateVehicle: 'admin/instructor/update-vehicle-detail',
      UpdateLicense: 'admin/instructor/update-License-detail'
    },

    Student: {
      StudentList: 'admin/student/list',
      StudentDetailsById: 'admin/student/{id}',
      ActiveInActive: 'admin/student/active-inactive',
      UpdateProfile: 'admin/student/update-profile'
    },

    setting: {
      GetPrivacyPolicy: 'admin/setting/privacy-policy/page',
      UpdatePrivacyPolicy: 'admin/setting/privacy-policy/save',
      GetTermsAndCondition: 'admin/setting/terms-condition/page',
      UpdateTermsAndCondition: 'admin/setting/terms-condition/save',
      GetCommissionRefferalCode : 'admin/setting/commission-referral-code',
      UpdateCommissionRefferalCode : 'admin/setting/commission-referral-code/save'
    },

    dashboard: {
      GetDashboardCountDetails: 'admin/dashboard/chart',
      GetDashboardDetailsbyuser: 'admin/dashboard/chart-detail'
    },

    coupon: {
      GetCouponList: 'admin/coupon/list',
      GetCouponDetailsById: 'admin/coupon/detail',
      AddUpdateCoupon: 'admin/coupon/save',
      DeleteCoupon: 'admin/coupon/{id}',
      GetCouponById: 'admin/coupon/{id}',
      colorlist : 'admin/coupon/color-list',
      ActiveInactiveCoupon : 'admin/coupon/active-inactive'
    },

    user: {
      getUserList: 'admin/user/list',
      getUserDetailsById: 'admin/user/{id}',
      addUpdateUser: 'admin/user/save',
      deleteUser: 'admin/user/{id}',
      activeInactiveUser: 'admin/user/active-inactive',
      GetAdminDetail:'user/getadmindetails'
    },

    role: {
      getRoleList: 'admin/role/list',
      getRoleDetailsById: 'admin/role/?roleId={roleId}',
      addUpdateRole: 'admin/role/save',
      deleteRole: 'admin/role/{id}',
      activeInactiveRole: 'admin/role/active-inactive',
    },

     slot: {
      SlotList: 'admin/slot/list',
      slotdetail : 'admin/slot'
    },

    booking: {
      BookingList: 'admin/booking/list',
      BookingDetails: 'admin/booking/{id}'
    },

    report:{
      GetMasterDetails : 'admin/progress-report/master-detail',
      GetStudentRepportDetail : 'admin/student/progress-report/{id}'
    }

  };
}
