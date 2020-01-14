import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  // {
  //   title: 'ARKA II',
  //   group: true,
  // },
  {
    title: 'Catalogo de Elementos',
    icon: 'nb-compose',
    children: [
      {
        title: 'Lista de Catalogos',
        link: '/pages/catalogo/list-catalogo',
      },
      // {
      //   title: 'Detalle de Catálogo',
      //   link: '/pages/catalogo_bienes/consulta_catalogo',
      // },
      {
        title: 'Construcción de Catálogo',
        link: '/pages/catalogo_bienes/registro_catalogo',
      },
      {
        title: 'Registro Elementos',
        link: '/pages/catalogo_bienes/registro_elementos',
      },
      {
        title: 'Inactivar Grupos y Subgrupos',
        link: '/pages/catalogo_bienes/inactiva_grupos',
      },
      {
        title: 'Asignacion de Cuentas',
        link: '/pages/catalogo_bienes/registro_cuentas_catalogo',
      },
    ],
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
    title: 'Bodega de Consumo',
    icon: 'nb-shuffle',
    children: [
      {
        title: 'Consultar Solicitudes',
        link: '/pages/bodega_consumo/consulta_solicitud',
      },
      {
        title: 'Solicitar Elementos',
        link: '/pages/bodega_consumo/agregar_elementos',
      },
      {
        title: 'kardex',
        link: '/pages/bodega_consumo/kardex',
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
      {
        title: 'Salidas',
        link: '/pages/reportes/registro-salidas',
      },
    ],
  },
  {
    title: 'Bodega de Consumo',
    icon: 'nb-compose',
    children: [
      {
        title: 'kardex',
        link: '/pages/bodega_consumo/kardex',
      },
    ],
  },
];
