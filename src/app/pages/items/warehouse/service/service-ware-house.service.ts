import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WareHouseModel } from '../models/warehouse';

@Injectable({
  providedIn: 'root'
})
export class ServiceWareHouseService {

    constructor(private http: HttpClient) { }

    async getWarehouse() {
        return await firstValueFrom(
            this.http.get<WareHouseModel[]>(
                `${environment.uriLogistic}/api/WareHouse`
            )
        );
    }

    async getWarehouseActive() {
        return await firstValueFrom(
            this.http.get<WareHouseModel[]>(
                `${environment.uriLogistic}/api/WareHouse/WareHouseActive`
            )
        );
    }

    async addWarehouse(request: WareHouseModel) {
        return await firstValueFrom(
            this.http.post<WareHouseModel[]>(
                `${environment.uriLogistic}/api/WareHouse`,
                request
            )
        );
    }
    async editWarehouse(request: WareHouseModel) {
        return await firstValueFrom(
            this.http.put<WareHouseModel[]>(
                `${environment.uriLogistic}/api/WareHouse`,
                request
            )
        );
    }
}
