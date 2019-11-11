export let FORM_INACTIVAR = {
    titulo: 'Grupo',
    tipo_formulario: 'mini',
    btn: 'Inactivar',
    alertas: true,
    modelo: 'Grupo',
    campos: [
        {
            etiqueta: 'input',
            claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
            nombre: 'Nombre',
            label_i18n: 'nombre',
            placeholder_i18n: 'nombre',
            requerido: true,
            tipo: 'text',
        },
        {
            etiqueta: 'textarea',
            claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
            nombre: 'Descripcion',
            label_i18n: 'descripcion',
            placeholder_i18n: 'descripcion',
            requerido: true,
            tipo: 'text',
        },
    ],
};
