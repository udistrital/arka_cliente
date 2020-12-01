export let FORM_MOVIMIENTO = {
    titulo: 'Movimiento',
    tipo_formulario: 'mini',
    // btn: 'Guardar',
    alertas: true,
    modelo: 'CuentasFormulario',
    campos: [
        {   minSearchLength:0,
            etiqueta: 'autocomplete',
            claseGrid: 'col-6',
            nombre: 'CuentaDebitoId',
            label_i18n: 'cuenta_debito',
            placeholder_i18n: 'cuenta_debito',
            requerido: true,
            id: 1,
            tipo: 'Cuenta',
            key: 'Codigo',
            opciones: [],
        },
        {   minSearchLength:0,
            etiqueta: 'autocomplete',
            claseGrid: 'col-6',
            nombre: 'CuentaCreditoId',
            label_i18n: 'cuenta_credito',
            placeholder_i18n: 'cuenta_credito',
            requerido: true,
            id: 0,
            tipo: 'Cuenta',
            key: 'Codigo',
            opciones: [],
        },
        // {
        //     etiqueta: 'input',
        //     claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
        //     nombre: 'Nombre',
        //     label_i18n: 'nombre',
        //     placeholder_i18n: 'nombre',
        //     requerido: true,
        //     tipo: 'text',
        // },
        // {
        //     etiqueta: 'textarea',
        //     claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
        //     nombre: 'Descripcion',
        //     label_i18n: 'descripcion',
        //     placeholder_i18n: 'descripcion',
        //     requerido: true,
        //     tipo: 'text',
        // },
        // {
        //     etiqueta: 'checkbox',
        //     claseGrid: 'col-6',
        //     nombre: 'Activo',
        //     label_i18n: 'activo',
        //     placeholder_i18n: 'activo',
        //     requerido: true,
        //     tipo: 'checkbox',
        // },

        // /* {
        //     etiqueta: 'select',
        //     claseGrid: 'col-6',
        //     nombre: 'Grupo',
        //     label_i18n: 'grupo',
        //     placeholder_i18n: 'grupo',
        //     requerido: true,
        //     tipo: 'Grupo',
        //     // key: 'Name',
        //     opciones: [],
        // }, */
    ],
};
