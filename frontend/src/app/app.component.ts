import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  titleService = inject(Title)
  router = inject(Router);
  showBackToTop = false;

  constructor() {}

  get pageTitle(): string {
    return this.titleService.getTitle().split("|")[0].trim();
  }

  getRoute(): string[] {
    const path = this.router.url.split(/[?#]/)[0];
    const segments = path.split('/').filter(segment => segment);

    return segments;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
