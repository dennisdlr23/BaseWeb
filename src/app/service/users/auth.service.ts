import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ConfigService } from '../app.config.service';
import { CommonService } from '../common.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient, private router: Router, public configService: ConfigService, private commonService:CommonService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get UserValue(): User {
        return this.currentUserSubject.value;
    }

    public getCurrentUserId(): number {
    const user = this.UserValue;
    return user ? user.userId : 0; // Retorna userId o 0 si no hay usuario autenticado
}

    public hasPermission(code:string): boolean{
        let hasPermission = this.UserValue.permissions.filter((item)=> item.path == code);
        return hasPermission.length >0;
    }

    async login(userName: string, password: string) {
        return await firstValueFrom(this.http.post<any>(`${environment.uriLogistic}/auth`, {  userName, password })
            .pipe(map(user => {
                if (user && user.token) {
                    let isDark = user.theme.toLowerCase().includes("dark");
                    this.changeTheme(user.theme,isDark);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            })));
    }


    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
        this.changeTheme('lara-light-indigo',false);
    }

    changeTheme(theme:string, dark:boolean){

        let themeElement = document.getElementById('theme-css');
        themeElement.setAttribute('href', 'assets/theme/' + theme + '/theme.css');
        this.configService.updateConfig({...this.configService.config, ...{theme, dark}});
    }
}
