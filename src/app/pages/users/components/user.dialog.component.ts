import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Messages } from 'src/app/helpers/messages';
import { Role } from 'src/app/models/role';
import { Theme } from 'src/app/models/theme';
import { User } from 'src/app/models/user';
import { CommonService } from 'src/app/service/common.service';
import { UserService } from 'src/app/service/users/user.service';

@Component({
    selector: 'user-dialog-component',
    templateUrl: './user.dialog.component.html',
})
export class UserDialogComponent implements OnInit {
    @Output() userModify = new EventEmitter<User[]>();
    user: User;
    isAdd: boolean;
    formUser: FormGroup;
    roles: Role[] = [];
    themes: Theme[] = [];
    loading: boolean = false;
    display: boolean = false;

    constructor( private fb: FormBuilder, private userService: UserService, private commonService: CommonService) {}

    ngOnInit() {

    }
    async _getRoles(){
        try{
            this.loading = true;
            this.roles = await this.userService.getRoles();
                      this.themes = await this.userService.getThemes();

            this.roles.unshift({roleId: 0, description:"Seleccione un Rol", active:true, detail:[]});
            this.themes.unshift({themeId: 0, description:"Seleccione un Tema", active:true});
            this.loading = false;
        }
        catch(ex){
            Messages.warning("Advertencia", ex);
            this.loading = false;
        }
    }

    showDialog(user:User, isAdd:boolean) {
        this.new();
        this.isAdd = isAdd;
        this.user = user;
        this._createFormBuild();
        this.display = true;
        this._getRoles();

    }
    _createFormBuild(){
        this.formUser = this.fb.group({
        userId: [this.user.userId??0],
        name: [this.user.name??"", Validators.required],
        userName: [this.user.userName??"", Validators.required],
        password: [this.user.password??"", Validators.compose( this.isAdd? [
            Validators.required,
            ]: [])
        ],
        email: [this.user.email??"", Validators.compose([
            Validators.required, Validators.email
        ])],
        roleId: [this.user.roleId??0, Validators.compose([
            Validators.required, Validators.min(1)
        ])],
        themeId: [this.user.themeId??0, Validators.compose([
            Validators.required, Validators.min(1)
        ])],
        active: [this.user.active??false],

        salesPerson: [this.user.salesPerson??false]
    })
    }

    new(){
        this.user = undefined;
        this.formUser = undefined;
    }


    async add(){
        if(this.formUser.valid){
            try{
                Messages.loading("Agregando", "Agregando Usuario");
                let users = await this.userService.add(this.formUser.value);
                Messages.closeLoading();
                Messages.Toas("Agregando Correctamente");
                this.userModify.emit(users);
                this.display = false;
            }
            catch(ex){
                Messages.closeLoading();
                Messages.warning("Advertencia", ex);
            }
        }
    }
    async edit(){
        if(this.formUser.valid){
            try{
                Messages.loading("Editando", "Editando Usuario");
                let users = await this.userService.edit(this.formUser.value);
                Messages.closeLoading();
                Messages.Toas("Editado Correctamente");
                this.userModify.emit(users);
                this.display = false;
            }
            catch(ex){
                Messages.closeLoading();
                Messages.warning("Advertencia", ex);
            }
        }
    }
}
