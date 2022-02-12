import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';

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
  constructor(private httpClient: HttpClient, private fb :FormBuilder){
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
    this.showSignUpForgetPage = false;
    this.showLoginPage = true;
  }
  getPassword(){
    if(this.forgetPasswordFormGroup.invalid){
      return;
    }
    this.passwordStatus = "";
    let emailId = this.forgetPasswordFormGroup.value.emailId
    let secreteCode = this.forgetPasswordFormGroup.value.secreteCode
    this.httpClient.get("http://localhost:8080/login/getPassword/"+emailId+"/"+secreteCode).subscribe(result => {
      this.passwordStatus = result;
      if(this.passwordStatus.statuscode == "OK"){
        this.errorPwd = false
      }else{
        this.errorPwd = true
      }
      console.log(result);
    });
  }
  get(){
   
    this.httpClient.get("http://localhost:8080/login/getAllUsers").subscribe(result => {
      
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
    this.httpClient.get("http://localhost:8080/login/authenticate/"+emailId+"/"+pwd).pipe(map(e=>e)).subscribe(result => {
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
    this.httpClient.post("http://localhost:8080/login/add",obj).subscribe(obj => {
      this.addUser = obj;
      if(this.addUser.statuscode == "OK"){
        this.signUpstatus = this.addUser.message;
        this.signupsuccess = true;
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
    this.httpClient.post("http://localhost:8080/comment/add",obj).subscribe(obj => {
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
    this.httpClient.get("http://localhost:8080/comment/getAllComments").subscribe(result => {
      this.allComments = result;
      if(this.allComments.statuscode == "OK"){
         this.nocommentsAvailable = false
      }
    });
  }
  filter(){
    this.httpClient.get("http://localhost:8080/comment/get/"+this.signedUser.entity[0].emailId).subscribe(result => {
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
}
