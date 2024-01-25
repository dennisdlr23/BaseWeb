import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DataDashBoard } from 'src/app/components/dashboard/models/data-dashboard';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    constructor(private http: HttpClient) { }

    async getData() {
        return await firstValueFrom(
            this.http.get<DataDashBoard[]>(
                `${environment.uriLogistic}/api/DataDashboard/GetData`
            )
        );
    }

}
