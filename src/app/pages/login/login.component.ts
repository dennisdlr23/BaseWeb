import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from '../../service/app.config.service';
import { AppConfig } from '../../api/appconfig';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/users/auth.service';
import { Messages } from 'src/app/helpers/messages';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles:[`
    :host ::ng-deep .p-password input {
    width: 100%;
    padding:1rem;
    }

    :host ::ng-deep .pi-eye{
      transform:scale(1.6);
      margin-right: 1rem;
      color: var(--primary-color) !important;
    }

    :host ::ng-deep .pi-eye-slash{
      transform:scale(1.6);
      margin-right: 1rem;
      color: var(--primary-color) !important;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {

  valCheck: string[] = ['remember'];

  userName: string;
  password: string;

  config: AppConfig;

  subscription: Subscription;

  constructor(public configService: ConfigService,private router: Router, private auth: AuthService){ }

  ngOnInit(): void {
    this.config = this.configService.config;
    this.subscription = this.configService.configUpdate$.subscribe(config => {
      this.config = config;
    });
  }


  async login(): Promise<void>{
    try{
      Messages.loading("Accediendo","Espere un momento por favor...")
      await this.auth.login(this.userName,this.password)
      Messages.closeLoading()
      this.router.navigateByUrl('/')
    }
    catch(ex){
      Messages.closeLoading()
      Messages.warning( "Advertencia", ex);
    }
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
