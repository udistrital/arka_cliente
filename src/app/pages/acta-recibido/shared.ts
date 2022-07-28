export class CommonActas {

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  static preparaSedes(sedes: any) {
    return sedes.sort((a, b) => a.Nombre.toLowerCase().localeCompare(b.Nombre.toLowerCase()));
  }

  static preparaDependencias(dependencias: any) {
    return dependencias.sort((a, b) => a.Nombre.toLowerCase().localeCompare(b.Nombre.toLowerCase()));
  }

  static convierteDependencias(dependencias: any) {
    return dependencias.map((dep) => { return {
      value: dep.Id,
      name: dep.Nombre,
    }; });
  }

}
