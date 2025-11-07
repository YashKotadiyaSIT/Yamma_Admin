
export interface Menu {
    menuId: number;
    menuName: string;
    url: string;
    icon?: string;
    parentMenuId?: number;
    allowView: boolean;
    allowAdd: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    allowApproveReject: boolean;
    displayOrder?: number;
    isActive: boolean;
    isDefault?: boolean;
}

export interface RoleRight {
    roleRightId?: number;
    roleId: number;
    menuId: number;
    isView: boolean;
    isAdd: boolean;
    isEdit: boolean;
    isDelete: boolean;
    isApproveReject: boolean;
}


