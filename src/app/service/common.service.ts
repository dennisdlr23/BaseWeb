import { TypeDocument } from './../models/type-document';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CompanyInfo } from '../models/company-info';
import { FileToUpload } from '../models/file.to.upload';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CommonService {
    constructor(private http: HttpClient) {}

    async uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        return await firstValueFrom(
            this.http.post<FileToUpload>(
                `${environment.uriLogistic}/api/Common/UploadFile`,
                formData
            )
        );
    }

}
