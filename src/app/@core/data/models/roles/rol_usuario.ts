export enum RolUsuario_t {    // para edicion
    Jefe = 1, // *
    Secretaria,             // reg *
    Contratista,            // elab, mod *
    Proveedor,              // reg
    Revisor,                // reg, verifica *
    admin_sistema,
}

export enum PermisoUsuario_t {
    Ninguno,
    Ver,
    Modificar,
}
