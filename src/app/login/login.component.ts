import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  title = 'Comment';
  addUserFormGroup!: FormGroup;
  signInUserFormGroup!: FormGroup;
  forgetPasswordFormGroup!: FormGroup;
  addCommentFormGroup!: FormGroup;
  showLoginPage: boolean = true;
  showPwdForgetPage: boolean = false;
  showSignUpForgetPage: boolean = false;
  showCommentPage: boolean = false;
  signPageError: boolean = false;
  unAuthorizedUser: boolean = false;
  invalidSignUp:boolean = false;
  errorsignup:boolean = false;
  signupsuccess:boolean = false;
  signedUser:any;
  addUser:any;
  signUpstatus:any;
  errorPwd:boolean = false;
  passwordStatus:any
  commentError: boolean =false;
  allComments:any;
  nocommentsAvailable: boolean = true;
  commentSuccess:boolean = false;
  commentMsgError:boolean = false;
  forgetPwdInvalid: boolean = false;
  constructor(private httpClient: HttpClient, private fb :FormBuilder, private route: Router){
    this.signInUserFormGroup = this.fb.group({
      emailId : ['',Validators.required],
      password: ['',Validators.required]
    })
    this.addUserFormGroup = this.fb.group({
      emailId : ['',[Validators.required,Validators.email]],
      password: ['',Validators.required],
      secreteCode: ['',Validators.required],
    });
    
    this.forgetPasswordFormGroup = this.fb.group({
      emailId : ['',Validators.required],
      secreteCode: ['',Validators.required],
    })
    this.addCommentFormGroup = this.fb.group({
      comment: ['',Validators.required],
    })
  }
  backToLogin(){
    this.forgetPwdInvalid = false;
    this.invalidSignUp = false;
    this.showSignUpForgetPage = false;
    this.showLoginPage = true;
    this.errorsignup = false;
    this.signupsuccess = false;
    this.signPageError = false;
    this.unAuthorizedUser = false;
    this.passwordStatus = false;
    this.forgetPasswordFormGroup.patchValue({
      emailId : "",
      secreteCode: "",
    });
    this.addUserFormGroup.patchValue({
      emailId : '',
      password: '',
      secreteCode: '',
    });

  }
  getPassword(){
    if(this.forgetPasswordFormGroup.invalid){
      this.forgetPwdInvalid = true;
      return;
    }
    this.passwordStatus = "";
    let emailId = this.forgetPasswordFormGroup.value.emailId
    let secreteCode = this.forgetPasswordFormGroup.value.secreteCode
    this.httpClient.get(environment.baseUrl+environment.getPwd+emailId+"/"+secreteCode).subscribe(result => {
      this.passwordStatus = result;
      if(this.passwordStatus.statuscode == "OK"){
        this.errorPwd = false
      }else{
        this.errorPwd = true
      }
    });
  }
  signIn(){
    if(this.signInUserFormGroup.invalid){
      this.signPageError = true;
      return;
    }
    this.signPageError = false;
    let emailId = this.signInUserFormGroup.value.emailId;
    let pwd = this.signInUserFormGroup.value.password;
    this.httpClient.get(environment.baseUrl+environment.signIn+emailId+"/"+pwd).pipe(map(e=>e)).subscribe(result => {
        this.signedUser = result
        if(this.signedUser.statuscode == "OK"){
          this.showCommentPage = true;
          this.showLoginPage = false;
          this.getAllComments();
        }else{
          this.unAuthorizedUser = true;
        }
    });
  }
  signupPage(){
    this.showLoginPage = false;
    this.showSignUpForgetPage = true;
    this.signInUserFormGroup.patchValue({
      emailId : '',
      password: ''
    })
  }
  saveUser(){
    if(this.addUserFormGroup.invalid){
      this.invalidSignUp = true;
      return;
    }
    this.invalidSignUp = false;
    this.signupsuccess = false;
    this.errorsignup = false
    let obj = {
      emailId: this.addUserFormGroup.value.emailId,
      password:this.addUserFormGroup.value.password,
      secreteCode: this.addUserFormGroup.value.secreteCode
      
    }
    this.httpClient.post(environment.baseUrl+environment.signUp,obj).subscribe(obj => {
      this.addUser = obj;
      if(this.addUser.statuscode == "OK"){
        this.signUpstatus = this.addUser.message;
        this.signupsuccess = true;
        this.addUserFormGroup.patchValue({
          emailId : '',
          password: '',
          secreteCode: '',
        });
      }else{
        this.signUpstatus = this.addUser.message;
        this.errorsignup = true;
      }
    });
    
  }
  saveComment(){
    if(this.addCommentFormGroup.invalid){
      this.commentError = true;
      return;
    }
    let obj = {
      emailId:this.signedUser.entity[0].emailId,
      comment:this.addCommentFormGroup.value.comment
    }
    this.httpClient.post(environment.baseUrl+environment.addComment,obj).subscribe(obj => {
      this.addUser = obj;
      if(this.addUser.statuscode == "OK"){
        this.commentSuccess = true;
        this.commentMsgError = false;
        this.clear();
        this.getAllComments();
      }else{
        this.signUpstatus = this.addUser.message;
        this.commentSuccess = false;
        this.commentMsgError = true;
      }
    });
  }

  getAllComments(){
    this.signInUserFormGroup.patchValue({
      emailId : '',
      password: ''
    })
    this.httpClient.get(environment.baseUrl+environment.allComments).subscribe(result => {
      this.allComments = result;
      if(this.allComments.statuscode == "OK"){
         this.nocommentsAvailable = false
      }
    });
  }
  filter(){
    this.commentSuccess = false;
    this.commentMsgError = false;
    this.httpClient.get(environment.baseUrl+environment.getComments+this.signedUser.entity[0].emailId).subscribe(result => {
      this.allComments = result;
      if(this.allComments.statuscode == "OK"){
         this.nocommentsAvailable = false
      }
    });
  }
  forgetPwdPage(){
    this.showLoginPage = false;
    this.showPwdForgetPage = true;
  }
  clear(){
    this.addCommentFormGroup.patchValue({
      comment: ''
    })
  }
  logout(){
    this.showLoginPage  = true;
    this.showPwdForgetPage  = false;
    this.showSignUpForgetPage  = false;
    this.showCommentPage  = false;
    this.signPageError  = false;
    this.unAuthorizedUser = false;
    this.invalidSignUp = false;
    this.errorsignup = false;
    this.signupsuccess = false;
    this. signedUser = ""
    this. addUser = ""
    this.signUpstatus= '';
    this.errorPwd = false;
    this.passwordStatus = ''
    this.commentError  =false;
    this.allComments = ''
    this.nocommentsAvailable  = true;
    this.commentSuccess = false;
    this.commentMsgError = false;
  }
}
