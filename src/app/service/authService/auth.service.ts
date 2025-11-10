import { Injectable } from '@angular/core';
import { StorageKey, StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private storageService: StorageService,
  ) { }

  

  isTokenExpired(): boolean {
    let expireDate = this.storageService.getValue(StorageKey.expireDate);
    return new Date().getTime() > new Date(expireDate).getTime();
  }

  isLoggedIn(): boolean {
    let token = this.storageService.getValue(StorageKey.authToken);
    if (token)
      return true;
    else
      return false;
  }

  getAccessToken(): any {
    let token = this.storageService.getValue(StorageKey.authToken);
    return token ? token : null;
  }

  setAccessToken(token: string) {
    this.storageService.setValue(StorageKey.authToken,token);
  }

  hasRight(menuId: number, right: string): boolean {
    const menuRight = this.getRights().find((r:any) => r.MenuId === menuId);
    return menuRight ? !!menuRight[right] : false;
  }

  getUserId(): any {
    let id = JSON.parse(this.storageService.getValue(StorageKey.currentUser)).id;
    return id ? id : null;
  }

  getUserName(): any {
    let name = JSON.parse(this.storageService.getValue(StorageKey.currentUser)).userName;
    return name ? name : null;
  }

  getUserFullName(): any {
    let name = JSON.parse(this.storageService.getValue(StorageKey.currentUser)).userFullName;
    return name ? name : null;
  }

  decodeToken(): any {
    const token = localStorage.getItem('authToken');

    if (!token) return null;

    try {
      // JWT is in format: header.payload.signature
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload); // decode base64
      return JSON.parse(decodedPayload);   // parse JSON
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  }

  getRights() {
    const decoded = this.decodeToken();
    if (decoded && decoded.unique_name) {
      const uniqueData = JSON.parse(decoded.unique_name);
      return uniqueData.RoleRightList || [];
    }
    return [];
  }

  getLoginUserId(): number | null {
    const decoded = this.decodeToken();

    if (decoded) {
      // If UserId is inside unique_name JSON (like RoleRightList)
      if (decoded.unique_name) {
        const uniqueData = JSON.parse(decoded.unique_name);
        return uniqueData.UserId || null;
      }

      // If UserId is directly a claim in the token
      if (decoded.UserId) {
        return decoded.UserId;
      }
    }

    return null;
  }

    getRoleId() {
    const decoded = this.decodeToken();
    if (decoded && decoded.unique_name) {
      const uniqueData = JSON.parse(decoded.unique_name);
      return uniqueData.RoleId || null;
    }
    return [];
  }

}
