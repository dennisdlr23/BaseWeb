import { AppComponent } from './app.component';
import { AppConfigComponent } from './config/app.config.component';
import { AppFooterComponent } from './app.footer.component';
import { AppMainComponent } from './app.main.component';
import { AppMenuComponent } from './menu/app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppTopBarComponent } from './app.topbar.component';
import { CameraPickerComponent } from './components/camera-picker/camera-picker.component';
import { CommonService } from './service/common.service';
import { ComponentsAppModule } from './components.modules';
import { ConfigService } from './service/app.config.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmptyComponent } from './components/empty/empty.component';
import { ErrorComponent } from './components/error/error.component';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { FilePickerPropioComponent } from './components/file-picker/file.picker.propio.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InputSwitchModule } from 'primeng/inputswitch';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { LandingComponent } from './components/landing/landing.component';
import { ListPermissionComponent } from './pages/permissions/list.permission.component';
import { ListRolesComponent } from './pages/roles/list.roles.component';
import { ListUsersComponent } from './pages/users/list.users.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { MenuService } from './service/app.menu.service';
import { MonitorInterceptor } from './helpers/monitor.interceptor';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { PermissionDialogComponent } from './pages/permissions/components/permission.dialog.component';
import { RoleDialogComponent } from './pages/roles/components/role.dialog.component';
import { SkeletonTableComponent } from './components/skeleton-table/skeleton.table.component';
import { UserDialogComponent } from './pages/users/components/user.dialog.component';
import { UserService } from './service/users/user.service';
import { WebcamModule } from 'ngx-webcam';
import {ColorPickerModule} from 'primeng/colorpicker';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { ListWareHouseComponent } from './pages/items/warehouse/list-ware-house/list-ware-house.component';
import { WareHouseDialogComponent } from './pages/items/warehouse/ware-house-dialog/ware-house-dialog.component';

@NgModule({
    imports: [
        ComponentsAppModule,
        InputSwitchModule,
        ColorPickerModule,
        ProgressSpinnerModule,
        WebcamModule
    ],
    declarations: [
        AppComponent,
        AppConfigComponent,
        AppFooterComponent,
        AppMainComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppTopBarComponent,
        CameraPickerComponent,
        DashboardComponent,
        EmptyComponent,
        ErrorComponent,
        FilePickerPropioComponent,
        LandingComponent,
        ListPermissionComponent,
        ListRolesComponent,
        ListUsersComponent,
        LoadingComponent,
        LoginComponent,
        NotfoundComponent,
        PermissionDialogComponent,
        RoleDialogComponent,
        SkeletonTableComponent,
        UserDialogComponent,
        ListWareHouseComponent,
        WareHouseDialogComponent,
    ],
    providers: [
        {provide: LocationStrategy, useClass: HashLocationStrategy},
         MenuService, ConfigService,UserService,CommonService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MonitorInterceptor, multi: true },
        // {provide: LOCALE_ID, useValue: 'es-HN'},
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
