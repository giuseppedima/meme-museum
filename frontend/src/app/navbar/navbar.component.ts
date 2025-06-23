import { Component, inject, AfterViewInit } from '@angular/core';
import { AuthService } from '../_services/auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var window: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
  authService = inject(AuthService);

  constructor() {
  }

  setupSidebarClickOutside() {
    const sidebar = document.querySelector('app-sidebar');
    const toggleButton = document.querySelector('#toggleSidebar');
    const body = document.querySelector('body');

    if(body && sidebar && toggleButton) {
      document.addEventListener('click', (event) => {
        // Controlla se il click è avvenuto fuori dalla sidebar
        if (event && event.target && !sidebar.contains(event.target as Node) && !toggleButton.contains(event.target as Node)) {
          // Chiudi la sidebar
          body.classList.remove('sidebar-open'); //mobile
        }
      });
    }
  }

  setupFullScreenButton() {
    document.addEventListener('fullscreenchange', () => {
      const maximizeButton = (document.querySelector('#toggleFullscreen > [data-lte-icon=maximize]') as HTMLElement);
      const minimizeButton = (document.querySelector('#toggleFullscreen > [data-lte-icon=minimize]') as HTMLElement);

      if(!maximizeButton || !minimizeButton) {
        console.error('Fullscreen buttons not found');
        return;
      }

      if(document.fullscreenElement) {
        // Entrato in modalità fullscreen
        maximizeButton.style.display = 'none';
        minimizeButton.style.display = '';
      } else {
        // Uscito dalla modalità fullscreen
        maximizeButton.style.display = '';
        minimizeButton.style.display = 'none';
      }
    });

  }

  ngAfterViewInit(): void {
    this.setupSidebarClickOutside();
    this.setupFullScreenButton();
  }
  

  // Metodo per il toggle manuale della sidebar
  toggleSidebar(): void {
    const body = document.querySelector('body');
    if (body) {
      // Non uso toggle perché avrei problemi nel caso di ridimensionamento pagina

      if( body.classList.contains('sidebar-open')) {
        body.classList.remove('sidebar-open'); //mobile
      }
      else {
        body.classList.add('sidebar-open'); //mobile
      }

      if( body.classList.contains('sidebar-collapse')) {
        body.classList.remove('sidebar-collapse'); //desktop
      }
      else {
        body.classList.toggle('sidebar-collapse'); //desktop
      }
    }
  }

  // Metodo per il toggle fullscreen
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
