import { Component, OnDestroy } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AuthService } from './service/users/auth.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items: MenuItem[];


    constructor(public appMain: AppMainComponent, public auth: AuthService) {
        this.items = [
            {
                label: 'Perfil',
                icon: 'pi pi-user',
                routerLink: '/uikit/formlayout',

            },
            {
                label: 'Cerrar Sesión',
                icon: 'pi pi-sign-out',
                command: ()=>{
                    this.auth.logout();
                }
            },
        ];
     }
}
