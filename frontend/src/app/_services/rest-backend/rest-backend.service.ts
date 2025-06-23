import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemeData, MemeDataPaginated } from '../types/meme-data.type';
import { CommentData, CommentDataPaginated } from '../types/comment-data-type';
import { UserData } from '../types/user-data.type';
import { AuthRequest } from '../types/auth-request.type';
import { CreateMemeRequest } from '../types/create-meme-request.type';

@Injectable({
  providedIn: 'root'
})
export class RestBackendService {

  url = "http://localhost:3000" 
  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };



  // AUTHENTICATION

  login(loginRequest: AuthRequest){
    const url = `${this.url}/auth`; 
    return this.http.post<string>(url, loginRequest, this.httpOptions);
  }

  signup(signupRequest: AuthRequest){
    const url = `${this.url}/signup`; 
    return this.http.post(url, signupRequest, this.httpOptions);
  }
  


  // USERS

  getUsers() {
    return this.http.get<UserData[]>(`${this.url}/users`);
  }


  
  // MEMES

  createMeme(createMemeRequest: CreateMemeRequest){
    const url = `${this.url}/memes`;
    const formData = new FormData();
    formData.append('title', createMemeRequest.title);
    formData.append('meme', createMemeRequest.meme);
    formData.append('tags', JSON.stringify(createMemeRequest.tags));
    
    // Non usare httpOptions per file upload - Angular gestirà automaticamente il Content-Type
    return this.http.post<MemeData>(url, formData);
  }

  searchMemes(query: string) {
    const url = `${this.url}/memes?${query}`;
    return this.http.get<MemeDataPaginated>(url);
  }

  getMemeById(memeId: number) {
    const url = `${this.url}/memes/${memeId}`;
    return this.http.get<MemeData>(url);
  }

  voteMeme(memeId: number, vote: 'upvote' | 'downvote') {
    const url = `${this.url}/memes/${memeId}/vote`;
    return this.http.post<MemeData>(url, {type: vote}, this.httpOptions);
  }

  deleteMeme(memeId: number) {
    const url = `${this.url}/memes/${memeId}`;
    return this.http.delete(url);
  }

  updateMeme(memeId: number, updateData: { title?: string; tags?: string[] }) {
    const url = `${this.url}/memes/${memeId}`;
    return this.http.put<MemeData>(url, updateData, this.httpOptions);
  }

  getTodaysMeme() {
    const url = `${this.url}/memes/daily`;
    return this.http.get<MemeData>(url);
  }



  // COMMENTS

  getComments(memeId: number, page: number = 1, pageSize: number = 10) {
    const url = `${this.url}/memes/${memeId}/comments?page=${page}&pageSize=${pageSize}`;
    return this.http.get<CommentDataPaginated>(url);
  }

  createComment(memeId: number, content: string) {
    const url = `${this.url}/memes/${memeId}/comments`;
    return this.http.post<CommentData>(url, {content}, this.httpOptions);
  }

  deleteComment(memeId: number, commentId: number) {
    const url = `${this.url}/memes/${memeId}/comments/${commentId}`;
    return this.http.delete(url);
  }

  updateComment(memeId: number, commentId: number, content: string) {
    const url = `${this.url}/memes/${memeId}/comments/${commentId}`;
    return this.http.put<CommentData>(url, {content}, this.httpOptions);
  }

}
