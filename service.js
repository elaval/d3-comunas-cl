'use strict';
/* jshint undef: true, unused: true */
/* global angular */

/**
 * @ngdoc service
 * @name tideApp.DataService
 * @requires $q
 * @requires d3
 * @requires _
 * @requires $http
 *
 * @description
 * Demo
 *
 */
angular.module('tideApp')
.service('DataService',[ '$q', 'd3', '_', '$http',function($q, d3,_, $http) {
  var myself = this;
  var comunasUrl = "data/comunas.json";
  var dataUrl = "data/datosComunas.tsv";
  
  /*
  * geodata
  * Carga archivo de datos con información geográfica de las comunas
  * Retorna una promesa que permite acceder al resultado en forma asíncrona
  */
  this.geoData = function() {
    var deferred = $q.defer();

    d3.json(comunasUrl, function(data) {
      deferred.resolve(data)
    });

    return deferred.promise;
  }

  /*
  * data
  * Carga archivo de datos en formato tsv que tiene una columna
  * con nombre "codigo_comuna" y otras columnas con datos asociados
  *
  * Una vez cargada la tabla, genera un objeto con el código
  * de cada comuna como llave y como valor un objeto con el conjunto 
  * de datos asociados a la comuna como atributos y valores.
  *
  * Ej. {13101: {numero_region:13, estudiantes:12345}, ...}
  */
  this.data = function() {
    var deferred = $q.defer();

    d3.tsv(dataUrl, function(data) {
      var comunas = _.groupBy(data, function(d) {
        return d.codigo_comuna;
      })
      // Recorre cada comuna y asigna los datos del primer registro asociado a cada una
      // (en caso de existir más de una fila por comuna se toma la primera)
      _.each(_.keys(comunas), function(codigo_comuna) {
        comunas[codigo_comuna] = comunas[codigo_comuna][0];
      })

      deferred.resolve(comunas)
    });

    return deferred.promise;
  }


}])




