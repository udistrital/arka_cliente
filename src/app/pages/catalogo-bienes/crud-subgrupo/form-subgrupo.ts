
export let FORM_SUBGRUPO = {
    titulo: 'Subgrupo1',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'Subgrupo',
    campos: [
        {
        etiqueta: 'input',
        claseGrid: 'col-lg-4 col-md-4 col-sm-4 col-xs-4',
        nombre: 'Codigo',
        label_i18n: 'codigo',
        placeholder: 'Ej.: 11',
        placeholder_i18n: 'codigo',
        requerido: true,
        tipo: 'text',
        maxlength: '2',
        valor: '2',
        prefix: {
            value: '',
        },
        suffix: {
            value: '',
        },
        pattern: {
            value: '^[0-9]{2}',
            message: '** Formato no válido. Ingrese dos dígitos',
        },
        },
        {
        etiqueta: 'input',
        claseGrid: 'col-lg-8 col-md-8 col-sm-8 col-xs-8',
        nombre: 'Nombre',
        label_i18n: 'nombre',
        placeholder_i18n: 'nombre',
        requerido: true,
        tipo: 'text',
        },
        {
        etiqueta: 'input',
        claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
        nombre: 'Descripcion',
        label_i18n: 'descripcion',
        placeholder_i18n: 'descripcion',
        requerido: true,
        tipo: 'text',
        },
    ],
};
    