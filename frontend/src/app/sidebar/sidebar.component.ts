import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OverlayScrollbars } from 'overlayscrollbars';
import type { ScrollbarsAutoHideBehavior } from 'overlayscrollbars';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  constructor() {}

  // ngOnInit viene chiamato dopo che il DOM è pronto
  ngOnInit(): void {
    const SELECTOR_SIDEBAR_WRAPPER: string = '.sidebar-wrapper';
    
    interface DefaultConfig {
      scrollbarTheme: string;
      scrollbarAutoHide: ScrollbarsAutoHideBehavior;
      scrollbarClickScroll: boolean;
    }
    
    const Default: DefaultConfig = {
      scrollbarTheme: 'os-theme-light',
      scrollbarAutoHide: 'leave' as ScrollbarsAutoHideBehavior,
      scrollbarClickScroll: true,
    };
    
    const sidebarWrapper: HTMLElement | null = document.querySelector(SELECTOR_SIDEBAR_WRAPPER) as HTMLElement;
    if (sidebarWrapper) {
      OverlayScrollbars(sidebarWrapper, {
        scrollbars: {
          theme: Default.scrollbarTheme,
          autoHide: Default.scrollbarAutoHide,
          clickScroll: Default.scrollbarClickScroll,
        },
      });
    }
  }
}