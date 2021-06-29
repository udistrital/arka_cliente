export let FORM_CATALOGO = {
    titulo: 'Catalogo',
    tipo_formulario: 'mini',
    btn: 'Guardar',
    alertas: true,
    modelo: 'Catalogo',
    campos: [
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
        etiqueta: 'radio',
        claseGrid: 'col-6',
        nombre: 'Activo',
        label_i18n: 'estado',
        placeholder_i18n: 'activo',
        requerido: true,
        opciones: [
            {
                Id: true,
                desc: 'activo',
            },
            {
                Id: false,
                desc: 'inactivo',
            },
        ],
    },
    // EL SIGUIENTE SE PUEDE CONSIDERAR A FUTURO
    // Probar con app/@theme/components/dinamicform (está comentado allá)
    // {
    //     etiqueta: 'toggle',
    //     multiple: false,
    //     claseGrid: 'col-6',
    //     nombre: 'Activo',
    //     label_i18n: 'estado',
    //     requerido: true,
    //     opciones: [
    //         {
    //             valor_i18n: 'activo',
    //             valor: 1,
    //         },
    //         {
    //             valor_i18n: 'inactivo',
    //             valor: 0,
    //         },
    //     ],
    // },
    ],
};
