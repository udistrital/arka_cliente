export enum RolUsuario_t {    // para edicion
    // Jefe = 1, // *
    SECRETARIA_ALMACEN,             // reg *
    CONTRATISTA,            // elab, mod *
    // Proveedor,              // reg
    REVISOR,                // reg, verifica *
    ADMIN_ALMACEN,
}

export enum PermisoUsuario_t {
    Ninguno,
    Ver,
    Modificar,
}
