'use strict';
/* jshint undef: true, unused: true */
/* global angular */




/**
 * @ngdoc controller
 * @name chilecompraApp.controller:CarrerasController
 * @requires $scope
 * @requires chilecompraApp.CarrerasDataService
 *
 * @property {array} colorOptions Array with options for colorAttributes
 * @property {string} colorAttribute Selected color attribute
 * @property {array} data Array with student data for the selected career & semester
 * @property {int} n Number of students in the selected data array
 * @property {int} maxCarreras Maximum number of carreras to be displayed when filtraTopCarreras is true
 * @property {array} semestres Array with the semesters options to be chosen
 * @property {string} selectedSemestre Selected semester for data selection
 * @property {string} psuValido Flag to select only data values with a valid psu score (prom_paa>0)
 * @property {string} loading Flag to show a "loading" message when its value is true
 * @description
 *
 * Controller for Carreras explorer
 *
 */
angular.module('tideApp')
.controller('AppController', ['$scope','DataService',function ($scope, dataService) {
	var myself = this;
    this.data = null;   // Datos con atributos asociados a cada comuna
    this.geoData = null;  // Datos topojson de comunas de chile
    this.projectionCenter = [-70.67, -33.60]; // Coordenadas para el centro de la proyección ()
    this.projectionZoom=10000; //Zoom aplicado a la proyección teritorial
    this.pos = [0,0]; // Traslación inicial del mapa
    this.k = 1; // Zoom inicial del mapa

    // regiones
    // Opciones de regiones para ser seleccionadas
    // Para cada región se definen coordenadas de traslación del mapa (en puntos) y factor de zoom
    // para desplegar el mapa centrado en la respectiva región 
    this.regiones = [
        {numero:15, nombre:"Tarapacá", pos:[-175,2745], zoom:0.92},
        {numero:1, nombre:"Iquique",  pos:[-28.37,1595], zoom:0.586},
        {numero:2, nombre:"Antofagasta",  pos:[123,719], zoom:0.307},
        {numero:3, nombre:"Atacama",  pos:[128.5,529.9], zoom:0.345},
        {numero:4, nombre:"Coquimbo",  pos:[148.6,356.6], zoom:0.456},
        {numero:5, nombre:"Valparaiso",  pos:[94.9,133.7], zoom:0.735},
        {numero:13, nombre:"Metropolitana",  pos:[0,0], zoom:1},
        {numero:6, nombre:"O'Higgins",  pos:[17,-263.9], zoom:1.265},
        {numero:7, nombre:"Maule",  pos:[171.9,-277.9], zoom:0.746},
        {numero:8, nombre:"Biobio",  pos:[268.9,-359.1], zoom:0.544},
        {numero:9, nombre:"Araucanía",  pos:[274.1,-637.5], zoom:0.637},
        {numero:10, nombre:"Los Lagos",  pos:[319.3,-534.2], zoom:0.334},
        {numero:11, nombre:"Aysén",  pos:[336,-526.2], zoom:0.221},
        {numero:12, nombre:"Magallanes",  pos:[285.2,-513.44], zoom:0.141},
    ];

    // Originalmente se selecciona la región metropolitana
    this.selectedRegion = this.regiones[6];

    // Función llamada cuando el usuario cambia la opción de región
    this.changeRegion = function() {
        myself.pos = this.selectedRegion.pos;
        myself.k = this.selectedRegion.k;
    }

    // Contructor del contenido HTML utilizado en el tooltip
    // genera una fila por cada atributo del objeto asociado al tooltip
    this.tooltipMessage = function(d) {
        var msg = "";
        _.each(_.keys(d), function(key) {
            msg += key+": "+d[key]+"<br>";
        });
        return msg;
    }
    
    // Llamadas al "servicio de datos" 
    // geoData -> carga datos geográficos (topojson) con las comunas de chile
    // cada comuna tiene un id (Ej 10105 para Frutillar).
    // 
    // data -> carga un objeto con atributos asociados a cada comuna
    // la llave del objeto para cada comna corresponde al id de la comuna
    // Ej. data['10105'] = {nombre:"Frutillar", "estudiantes":12345, ...}
    //
    dataService.geoData()
    .then(function(d) {
        myself.geoData=d;
        return dataService.data();
    })
    .then(function(d) {
        myself.data=d;
    })
  
}]);
