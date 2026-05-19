# Requerimiento Técnico: Parametrización Contable Clase `53504`

## Contexto

Se validó el caso de la clase `53504` (`COMPUTO - (DEV)`) al intentar asignar cuentas contables desde el módulo `Catálogo > Cuentas`.

## Caso validado

- Clase: `53504`
- Movimiento: `22`
- Nombre movimiento: `Depreciación`
- Código movimiento: `DEP`
- Fecha de validación: `2026-05-19`

## Hallazgos

### 1. La clase sí tiene detalle activo

Consulta:

```http
GET /catalogo_elementos_crud/v1/detalle_subgrupo?sortby=FechaCreacion&order=desc&limit=-1&query=Activo:true,SubgrupoId__Id:53504
```

Resultado relevante:

- `SubgrupoId.Id = 53504`
- `TipoBienId.Id = 14`
- `TipoBienId.Nombre = "Devolutivo V"`

### 2. El movimiento sí existe y está activo

Consulta:

```http
GET /movimientos_arka_crud/v1/formato_tipo_movimiento?query=Id:22&limit=1
```

Resultado relevante:

- `Id = 22`
- `CodigoAbreviacion = "DEP"`
- `Nombre = "Depreciación"`
- `Activo = true`

### 3. No existe parametrización para la combinación `53504 + 22`

Consulta:

```http
GET /arka_mid/v1/catalogo_elementos/cuentas_contables/53504?movimientoId=22
```

Resultado:

```json
[]
```

### 4. Existen registros previos desalineados para la clase

Consulta de referencia:

```http
GET /arka_mid/v1/catalogo_elementos/cuentas_contables/53504?movimientoId=0
```

Resultados relevantes:

- Existe parametrización previa para `ENT_ADQ`.
- Existe una fila placeholder para `CRR` con `Id = 0` y cuentas nulas.
- Las filas devueltas usan `TipoBienId = 10` (`Devolutivo`), mientras que el detalle activo actual de la clase usa `TipoBienId = 14` (`Devolutivo V`).

## Problema técnico

El módulo de asignación de cuentas consulta correctamente la clase y el movimiento, pero el MID no retorna filas para la combinación `SubgrupoId = 53504` y `movimientoId = 22`.

Adicionalmente, hay inconsistencia entre:

- `detalle_subgrupo.TipoBienId = 14`
- `cuentas_contables.TipoBienId = 10` en registros históricos de la misma clase

Esto impide trabajar sobre una parametrización coherente para el tipo de bien vigente.

## Requerimiento para backend/datos

### 1. Crear o habilitar la parametrización inicial para `DEP`

Se requiere que el backend permita persistir una fila contable para:

- `SubgrupoId = 53504`
- `TipoBienId = 14`
- `SubtipoMovimientoId = 22`
- `TipoMovimientoId = 0` cuando aplique el patrón usado por movimientos no `ENT_*`
- `CuentaDebitoId` y `CuentaCreditoId` válidas

### 2. Confirmar soporte de alta desde transacción

El front fue ajustado para poder construir filas nuevas con `Id = 0` cuando no existan registros previos.  
Se requiere confirmar que el endpoint:

```http
PUT /catalogo_elementos_crud/v1/tr_cuentas_subgrupo/{subgrupoId}
```

soporte comportamiento `upsert` para filas nuevas con `Id = 0`.

Si ese comportamiento no existe hoy, backend debe:

- implementarlo en `tr_cuentas_subgrupo`, o
- definir y documentar el uso de `POST /catalogo_elementos_crud/v1/cuentas_subgrupo` para altas iniciales desde UI.

### 3. Regularizar datos desalineados por `TipoBienId`

Se requiere revisar las filas históricas de `cuentas_subgrupo` para la clase `53504` que aún estén asociadas a `TipoBienId = 10`, y determinar si:

- deben migrarse a `TipoBienId = 14`, o
- deben mantenerse inactivas y excluirse de la respuesta actual del MID.

### 4. Ajustar respuesta del MID para la clase vigente

Se espera que:

```http
GET /arka_mid/v1/catalogo_elementos/cuentas_contables/53504?movimientoId=22
```

retorne al menos una fila editable para el tipo de bien vigente de la clase.

## Criterios de aceptación

- `detalle_subgrupo` y `cuentas_contables` quedan alineados en `TipoBienId = 14` para la clase `53504`.
- `movimientoId = 22` retorna filas en `cuentas_contables/53504?movimientoId=22`.
- El guardado desde UI puede crear la parametrización inicial sin depender de registros preexistentes.
- Luego de guardar, una nueva consulta al MID retorna filas con `Id` real distinto de `0`.
- El módulo no vuelve a mostrar el mensaje `Clase sin parametrizar` para este caso.

## Payload de referencia esperado

Ejemplo lógico de fila a persistir:

```json
{
  "Id": 0,
  "CuentaDebitoId": 123,
  "CuentaCreditoId": 456,
  "TipoMovimientoId": 0,
  "SubtipoMovimientoId": 22,
  "TipoBienId": {
    "Id": 14
  }
}
```

## Nota de implementación

El front ya fue ajustado para:

- listar todos los tipos de movimiento activos,
- permitir abrir el formulario aunque no existan filas previas,
- construir una plantilla editable para la creación inicial.

La persistencia definitiva depende de que backend/datos soporte y normalice el caso descrito.
