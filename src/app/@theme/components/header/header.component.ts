import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AnalyticsService } from '../../../@core/utils';
import { LayoutService } from '../../../@core/utils';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NotificacionesService } from '../../../@core/utils/notificaciones.service';
import { Subscription, Observable } from 'rxjs';
import { CatalogoComponent } from '../../../pages/catalogo/catalogo.component';
import { CatalogoService } from '../../../@core/data/catalogo.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {

  @Input() position = 'normal';

  user: any;
  title: any;

  itemClick: Subscription;
  liveTokenValue: boolean = false;
  username = '';
  userMenu = [{ title: 'ver todas', icon: 'fa fa-list' }];
  public noNotify: any = '0';
  private autenticacion = new ImplicitAutenticationService;
  public activeLang = 'es';
  toggle: boolean;
  clientes$: Observable<boolean>;


  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private router: Router,
    private analyticsService: AnalyticsService,
    private layoutService: LayoutService,
    public notificacionService: NotificacionesService,
    // private catalogoService: CatalogoService,
    public translate: TranslateService) {

    this.translate = translate;
    this.toggle = false;
    this.itemClick = this.menuService.onItemClick()
      .subscribe((event) => {
        this.onContecxtItemSelection(event.item.title);
      });

    this.notificacionService.arrayMessages$
      .subscribe((notification: any) => {
        const temp = notification.map((notify: any) => {
          return { title: notify.Content.Message, icon: 'fa fa-commenting-o' };
        });
        this.userMenu = [...temp.slice(0, 7), ...[{ title: 'ver todas', icon: 'fa fa-list' }]];
      });
    this.liveToken();
  }


  ngOnInit() {
    // this.userService.getUsers()
    //   .subscribe((users: any) => this.user = users.nick);
    // this.clientes$ = this.catalogoService.getEstado$();
    // this.clientes$.subscribe(cliente => this.toggle = cliente);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  liveToken() {
    if (this.autenticacion.live()) {
      this.liveTokenValue = this.autenticacion.live();
      this.username = (this.autenticacion.getPayload()).sub;
    }
    return this.autenticacion.live();
  }

  onContecxtItemSelection(title) {
    if (title === 'ver todas') {
      this.router.navigate(['/pages/notificacion/listado']);
    }
  }

  changeStateNoView(): void {
    this.notificacionService.changeStateNoView(this.username);
  }
  login(): void {
    this.autenticacion.getAuthorizationUrl(false);
  }
  logout() {
    this.autenticacion.logout();
    // this.liveTokenValue = auth.live(true);
  }
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    // this.catalogoService.CambiarEstado()
    this.layoutService.changeLayoutSize();
    return false;
  }
  toggleNotifications(): boolean {
    this.sidebarService.toggle(false, 'notifications-sidebar');
    this.changeStateNoView();
    return false;
  }
  goToHome() {
    this.menuService.navigateHome();
  }

  startSearch() {
    this.analyticsService.trackEvent('startSearch');
  }
}
