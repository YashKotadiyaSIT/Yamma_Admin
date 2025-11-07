import { Injectable } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  function?: any;
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}


@Injectable()
export class NavigationItem {
  get(): Navigation[] {
    const token = localStorage.getItem('authToken');
    if (!token) return [];

    // Decode payload
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = JSON.parse(json);

    // Parse user data
    const userData = JSON.parse(decoded.unique_name);

    const roleRightList = userData.RoleRightList || [];
    // Build navigation dynamically from MenuList
    const menuList = userData.MenuList || [];

    const navigation: Navigation[] = menuList
      .filter((m: any) => {
        // find rights for this menu
        const rights = roleRightList.find((r: any) => r.MenuId === m.MenuId);
        // allow only if IsView = true
        return rights && rights.IsView;
      })
      .map((m: any) => ({
        id: m.MenuId.toString(),
        title: m.MenuName,
        type: 'group',
        icon: 'icon-user',
        children: [
          {
            id: m.MenuId.toString(),
            title: m.MenuName,
            type: 'item',
            url: m.Url,
            icon: m.Icon,
            classes: 'nav-item'
          }
        ]
      }));

    return navigation;
  }
}
