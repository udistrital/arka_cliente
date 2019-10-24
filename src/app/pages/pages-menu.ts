import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'ARKA',
    group: true,
  },
  {
    title: 'Acta de Recibido',
    icon: 'nb-compose',
    children: [
      {
        title: 'Consulta de Actas',
        link: '/pages/acta_recibido/consulta_acta_recibido',
      },
      {
        title: 'Registro de Acta',
        link: '/pages/acta_recibido/registro_acta_recibido',
      },
      // {
      //   title: 'Edicion de Acta',
      //   link: '/pages/acta_recibido/edicion_acta_recibido',
      // },
      // {
      //   title: 'Verificación de Acta',
      //   link: '/pages/acta_recibido/verificacion_acta_recibido',
      // },
      // {
      //   title: 'Ver Detalle',
      //   link: '/pages/acta_recibido/ver_detalle',
      // },
      // {
      //   title: 'Capturar Elementos',
      //   link: '/pages/acta_recibido/capturar_elementos',
      // },
    ],
  },
  {
    title: 'Catalogo',
    icon: 'nb-compose',
    link: '/pages/catalogo',
    children: [
      {
        title: 'Lista Catalogo',
        link: '/pages/catalogo/list-catalogo',
      },
      {
        title: 'CRUD Catalogo',
        link: '/pages/catalogo/crud-catalogo',
      },
    ],
  },
  {
    title: 'Grupo',
    icon: 'nb-compose',
    link: '/pages/grupo',
    children: [
      {
        title: 'Lista Grupo',
        link: '/pages/grupo/list-grupo',
      },
      {
        title: 'CRUD Grupo',
        link: '/pages/grupo/crud-grupo',
      },
    ],
  },
  {
    title: 'Subgrupo 1',
    icon: 'nb-compose',
    link: '/pages/subgrupo_1',
    children: [
      {
        title: 'Lista Subgrupo 1',
        link: '/pages/subgrupo_1/list-subgrupo_1',
      },
      {
        title: 'CRUD Subgrupo 1',
        link: '/pages/subgrupo_1/crud-subgrupo_1',
      },
    ],
  },
  {
    title: 'Entradas',
    icon: 'nb-list',
    children: [
      {
        title: 'Consultar Entradas',
        link: '/pages/entradas/consulta_entrada',
      },
      {
        title: 'Registrar Entrada',
        link: '/pages/entradas/registro',
      },
    ],
  },
  {
    title: 'Salidas',
    icon: 'nb-paper-plane',
    children: [
      {
        title: 'Consultar Salida',
        link: '/pages/salidas/consulta_salidas',
      },
      {
        title: 'Registrar Salida',
        link: '/pages/salidas/registro_salidas',
      },
    ],
  },
  {
    title: 'Movimientos',
    icon: 'nb-shuffle',
    children: [
      {
        title: 'Consultar Baja de Bien',
        link: '/pages/movimientos/consulta_baja_bien',
      },
      {
        title: 'Solicitud de Baja de Bien',
        link: '/pages/movimientos/solicitud_baja_bien',
      },
      {
        title: 'Aprobación de Baja de Bien',
        link: '/pages/movimientos/aprobacion_baja_bien',
      },
    ],
  },
  {
    title: 'Reportes',
    icon: 'nb-compose',
    children: [
      {
        title: 'Entradas',
        link: '/pages/reportes/registro-entradas',
      },
    ],
  },
  {
    title: 'Catalogo de Bienes',
    icon: 'nb-compose',
    children: [
      {
        title: 'Consultar Catálogo',
        link: '/pages/catalogo_bienes/consulta_catalogo',
      },
    ],
  },
];
