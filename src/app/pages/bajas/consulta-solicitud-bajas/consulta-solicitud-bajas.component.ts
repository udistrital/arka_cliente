import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'consulta-solicitud-bajas',
  templateUrl: './consulta-solicitud-bajas.component.html',
  styleUrls: ['./consulta-solicitud-bajas.component.scss']
})
export class ConsultaSolicitudBajasComponent implements OnInit {
  settings: any;
  listColumns: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
  ) {
    this.loadTablaSettings();

  }

  ngOnInit() {
  }

  loadTablaSettings() {
    this.listColumns = {
      Id: {
        title: 'Consecutivo',
        valuePrepareFunction: (value: any) => {
          return value;
        },
      },
      FechaRegistro: {
        title: 'Fecha de registro',
        width: '70px',
        valuePrepareFunction: (value: any) => {
          const date = value.split('T');
          return date[0];
        },
        filter: {
          type: 'daterange',
          config: {
            daterange: {
              format: 'yyyy/mm/dd',
            },
          },
        },
      },
      FechaVistoBueno: {
        title: 'Fecha de Visto Bueno',
        width: '70px',
        valuePrepareFunction: (value: any) => {
          const date = value.split('T');
          return date[0];
        },
        filter: {
          type: 'daterange',
          config: {
            daterange: {
              format: 'yyyy/mm/dd',
            },
          },
        },
      },
      RevisorId: {
        title: 'Revisor',
        valuePrepareFunction: (value: any) => {
          return value;
        },
      },
      SolicitanteId: {
        title: 'Solicitante',
        valuePrepareFunction: (value: any) => {
          return value;
        },
      },
      EstadoId: {
        title: 'Estado',
        valuePrepareFunction: (value: any) => {
          return value;
        },
      },
    };
    this.settings = {
      hideSubHeader: false,
      noDataMessage: 'No se encuentran solicitudes asociadas',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: true,
        edit: true,
        delete: true,
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-pencil-alt"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-eye"></i>',
      },
      mode: 'external',
      columns: this.listColumns,
    };
  }
  onEdit(event): void {
    
  }
  itemselec(event): void {
    // console.log('afssaf');
  }
  onCreate(event): void {
    this.router.navigate(['/pages/bajas/solicitud_bajas']);
  }

  onDelete(event): void {
    
  }

  onBack() {
   
  }
}
