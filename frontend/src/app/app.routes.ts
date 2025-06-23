import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { LogoutComponent } from './logout/logout.component';
import { MemeUploadComponent } from './meme-upload/meme-upload.component';
import { authGuard } from './_guards/auth/auth.guard';
import { noAuthGuard } from './_guards/auth/noauth.guard';
import { MemesListComponent } from './memes-list/memes-list.component';
import { MemeDetailsComponent } from './meme-details/meme-details.component';
import { TodaysMemeComponent } from './todays-meme/todays-meme.component';

export const routes: Routes = [
  {
    path: "homepage",
    component: HomepageComponent,
    title: "Homepage | MemeMuseum"
  }, {
    path: "memes/upload",
    component: MemeUploadComponent,
    title: "Upload meme | MemeMuseum",
    canActivate: [authGuard]
  }, {
    path: "memes/daily",
    component: TodaysMemeComponent,
    title: "Today's meme | MemeMuseum",
  }, {
    path: "memes/:id",
    component: MemeDetailsComponent,
    title: "Meme details | MemeMuseum",
  }, {
    path: "memes",
    component: MemesListComponent,
    title: "Memes list | MemeMuseum",
  }, {
    path: "login",
    component: LoginComponent,
    title: "Login | MemeMuseum",
    canActivate: [noAuthGuard]
  }, {
    path: "signup",
    component: SignupComponent,
    title: "Sign up | MemeMuseum",
    canActivate: [noAuthGuard]
  }, {
    path: "logout",
    component: LogoutComponent,
    title: "Log out | MemeMuseum",
    // canActivate: [authGuard]
  }, {
    path: "",
    redirectTo: "/homepage",
    pathMatch: 'full'
  }, {
    path: "**",
    redirectTo: "/homepage"
  }
];
