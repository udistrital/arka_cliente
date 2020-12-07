
export let FORM_CATALOGO = {
    titulo: 'Catalogo',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'Catalogo',
    campos: [
    // {
    //     etiqueta: 'input',
    //     claseGrid: 'col-6',
    //     nombre: 'Id',
    //     label_i18n: 'id',
    //     placeholder_i18n: 'id',
    //     requerido: true,
    //     tipo: 'number',
    // },
    {   
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'Nombre',
        label_i18n: 'nombre',
        placeholder_i18n: 'nombre',
        requerido: true,
        tipo: 'text',
    },
    {
        etiqueta: 'input',
        claseGrid: 'col-6',
        nombre: 'Descripcion',
        label_i18n: 'descripcion',
        placeholder_i18n: 'descripcion',
        requerido: true,
        tipo: 'text',
    },
    {
        etiqueta: 'mat-date',
        claseGrid: 'col-6',
        nombre: 'FechaInicio',
        label_i18n: 'fechainicio',
        placeholder_i18n: 'fechainicio',
        requerido: true,
        tipo: 'date',
    },
    {
        etiqueta: 'mat-date',
        claseGrid: 'col-6',
        nombre: 'FechaFin',
        label_i18n: 'fechafin',
        placeholder_i18n: 'fechafin',
        requerido: true,
        tipo: 'date',
    },
    {
        etiqueta: 'checkbox',
        claseGrid: 'col-6',
        nombre: 'Activo',
        label_i18n: 'activo',
        placeholder_i18n: 'activo',
        requerido: true,
        tipo: 'checkbox',
    },
    ],
};
