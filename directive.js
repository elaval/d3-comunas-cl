
"use strict";
/* jshint undef: true, unused: true */
/* global angular */

/**
 * @ngdoc directive
 * @name tide-angular.directive:tdXyChart
 * @requires underscore._
 * @requires d3service.d3
 * @requires toolTip
 * @element div
 * 
 * @param {object} tdGeoData Objeto en formato toposon con especificaciñon geográfica de comunas de Chile
 * @param {object} tdData Objeto con atributos de cada comuna (las llave corresponden a los IDs de cada comuna)
 * @param {function=} tdTooltipMessage Función que retorna un texto html a ser desplegado en el tooltip
 * @param {number=} tdZoom Factor de zoom vigente en el despliegue del mapa de comunas
 * @param {number=} tdPos Coordenadas de desplazamiento [x,y] en el despliegue del mapa de comunas
 * @param {number=} tdProjectionCenter Coordenadas geográficas (longitud, latitud) en la cual se centra la proyección (mapa) base de comunas (los desplacamientos son c/r a este punto)
 * @param {number=} tdProjectionZoom Factor de zoom para l aproyección base de comunas (los zooms posteriores son sobre esta base)
 * @param {object=} tdSelectedRegion Objeto con datos de la región seleccionada (incluye atributos numero, pos & zoom)
 * Generates a scatered XY Chart
 *
 */
angular.module("tide-angular")
.directive("tdMapaInteractivo",["$compile","_", "d3", "toolTip", "$window" ,function ($compile,_, d3, tooltip, $window) {
 return {
  restrict: "A",
      require: '?ngModel', // get a hold of NgModelController
      scope: {
        geoData: "=tdGeoData",  // Datos geográficos en formato topojson
        data: "=tdData",        // Objeto con datos asociados a cada comuna
        tooltipMessage: "=?tdTooltipMessage",
        zoom: "=?tdZoom",
        pos:"=?tdPos",
        projectionCenter:"=?tdProjectionCenter",
        projectionZoom:"=?tdProjectionZoom",
        selectedRegion:"=?tdSelectedRegion"
      },
      
      link: function (scope, element, attrs, ngModel) {
        var heightWidthRatio = 0.75;

        var margin = {};
        margin.left = 0;
        margin.right = 0;
        margin.top = 0;
        margin.bottom = 0;
        var width = element.width() ? element.width()-margin.left-margin.right : 600;
        var height = heightWidthRatio*width;

        // Variables definidas en base a parámetros de la directiva
        var projectionZoom = scope.projectionZoom ? scope.projectionZoom : 10000;
        var projectionCenter = scope.projectionCenter ? scope.projectionCenter :[-70.67, -33.60];

        // tooltipMessage es una función que retorna el contenido (en html) para el tooltip
        // asociado a un objeto.
        // Se especra que sea una función del cotrolador pasada como atributo
        // tdTooltipMessage="controller.tooltipMessage"
        //
        var tooltipMessage = scope.tooltipMessage 
          ? scope.tooltipMessage
          : function(d) {return d.id+"<br>"} 

        // Tooltip functionality (uses d3.tip livrary)
        var tip = d3.tip().attr('class', 'd3-tip').html(tooltipMessage);

        // svgMainContainer
        // Elemento principal SVG que se incrusta en el elemento
        // que corresponde a la directiva
        var svgMainContainer = d3.select(element[0])
          .append("svg")
          .attr("width", width+margin.left+margin.right)
          .attr("height", height+margin.top+margin.bottom)
          
        // Elemento "g" que se incrusta en el elemento SVG
        // se desplaza un margen a la izauierda y en la parte superior
        // Todos los elementos de la visualización se agregan como 
        // hijos de este elemento.
        var svgContainer = svgMainContainer
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top+ ")");
 
        // Iniciar funcionalidad del tooltip asociada al contenedor general
        svgContainer
        .call(tip)

        // Escala de colores utilizada para asignar distintos colores a las comunas.
        var colorScale = d3.scale.category20();

        // Recuadro de fondo sobre el cual dibujar los mapas
        svgContainer.append("rect")
          .attr("class", "background")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "lightblue")

        // Contenedor con mapas de comunas
        var comunasContainer =  svgContainer.append("g")
          .attr("id", "comunas")
          .attr("stroke-width", "0.5px")  // Grosor del controno de las comunas
          .attr("stroke","grey")          // Color del contorno de las comunas
        
        // Definición de la proyeccion territorial
        var projection = d3.geo.mercator()
          .scale(projectionZoom)
          .center(projectionCenter) 
          .translate([width / 2, height / 2]);

        // gozoom
        // Se ejecuta cuando el usuario cambia la posicion o el zoom
        // del mapa utilizano el mouse.
        var gozoom = function(d) {
          // Obtiene datos de traslación y/o factor de zoom del evento generado por la operación
          var x = d3.event.translate[0];
          var y = d3.event.translate[1];
          var zoomFactor = d3.event.scale;

          // Comunica los datos de zoom & posición al controlles (a través de atributos td-zoom & td-pos)
          // Esto es para efectos de debuging & ayudar a definir posiciones de las regiones
          scope.zoom = zoomFactor;
          scope.pos = [x,y];
          scope.$apply();  // Difundir los cambios a angular (no se hace automáticamente ya que el llamado a esta función no es controlado por angular) 
          
          // Traslada y escala el contenedor del mapa de comunas
          // para centrarlo en la posición indicada por la operación 
          // de zoom.
          comunasContainer
              .attr("transform", "translate(" + x + "," + y + ")scale(" + zoomFactor + ")")
              .style("stroke-width", .5/zoomFactor + "px");  // Se debe modificar el grosor de los bordes para ajustarlo al zoom especificado
              
        }
        
        // Definición de funcionalidad de zoom por D3
        var zoom = d3.behavior.zoom()
          //.translate(projection.translate())
          .scale(1)
          .scaleExtent([0.1, 100])
          .on("zoom", gozoom);
        
        // Aplicar funcionalidad de zoom al contenedor general
        svgContainer
          .call(zoom);
          
        // resize
        // Es llamado cada vez que cambien las dimensiones de la ventana del navegador
        // para ajustar las dimensiones de los elementos
        var resizeSvg = function() {         
          width = element.width()-margin.left-margin.right;
          height = width*heightWidthRatio//-margin.top-margin.bottom;
          svgMainContainer
            .attr("width",element.width())
            .attr("height",height+margin.top+margin.bottom)
          svgContainer.selectAll(".background")
            .attr("width", width)
            .attr("height", height)
        }

        /*
        * renderProjection
        */
        var renderProjection = function() {
          var dataComuna = scope.data;
          var geoData = scope.geoData;

          // continuar sólo si hay datos geográficos y de atributos de comunas
          if (dataComuna && geoData) { 

            // Genera datos topográficos para cada comuna
            var comunas_topo_data = topojson.feature(scope.geoData, scope.geoData.objects.cl_comunas).features;

            // Agrega propiedades con datos de cada cokmuna
            _.each(comunas_topo_data, function(d) {
              var id_comuna = +d.id;  // Convierte a entero para compatibilidad con otras fuentes (09101 -> 9101)
              d.properties = dataComuna[id_comuna]; // Asigna propiedades cargadas de tabla con datos por comuna
            })

            // Generador de elementos "d" que definen el path de todas las comunas
            var path = d3.geo.path()
                .projection(projection);

            // Asociar datos de cada comuna al selector "comunas"
            var comunas = comunasContainer.selectAll(".comuna")
                .data(comunas_topo_data, function(d) {return d.id})

            // Crear elementos para comunas si no existen
            comunas    
              .enter()
              .append("path")
                .attr("class", function(d) { return "comuna " + d.id; })
                .attr("stroke", "grey")
                .attr("fill", function(d) { return colorScale(d.properties.codigo_region)})
                //.attr("style", function(d) { return "stroke:grey;" + "fill:"+colorScale(d.properties.codigo_region)})
                .on("mouseenter", function(d) {
                  tip.show(d.properties);
                })
                .on("mouseleave", function(d) {
                  tip.hide(d);
                })
            
            // Dibuja el trazo de las comunas para elementos nuevos y existentes
            comunas
              .attr("d", function(d) {
                return path(d);
              })

            placeSelectedRegion();

          }

        }

        // positionSelectedRegion
        // Cambia la traslción y escala del contenedor de los mapas
        // para centrar la respectiva región.
        var placeSelectedRegion = function() {
          var posX = scope.selectedRegion.pos[0];
          var posY = scope.selectedRegion.pos[1];
          var zoomFactor = scope.selectedRegion.zoom;

          // Modificar posición de contenedor de comunas a la posición de la región
          comunasContainer
              .transition()
              .attr("transform", "translate(" + posX + "," + posY + ")scale(" + zoomFactor + ")")
              .style("stroke-width", .5/zoomFactor + "px");

          // Modificar colores de comunas según la región
          comunasContainer.selectAll(".comuna")
              .attr("style", function(d) { 
                var colorComuna = (+d.properties.codigo_region!==+scope.selectedRegion.numero) ? "white" : colorScale(d.id);
                return "stroke:grey;" + "fill:"+colorComuna+";";
              })
              .attr("opacity", function(d) {
                // Define opacidad 0.2 para regiones no seleccionadas
                return (+d.properties.codigo_region!==+scope.selectedRegion.numero) ? 0.2 : 1;
              })

          // Ajustar posición en el controlador de zoom
          zoom
          .translate([posX,posY])
          .scale(zoomFactor);

          // Comunica los datos de zoom & posición al controlles (a través de atributos td-zoom & td-pos)
          // Esto es para efectos de debuging & ayudar a definir posiciones de las regiones
          scope.zoom = zoomFactor;
          scope.pos = [posX,posY];

        }

        // Observar cambios en objeto de datos con propiedades de cada comuna
        scope.$watch("data", function () {
          renderProjection();
        });      

        // Observar cambios en la definicón de datos geográficos
        scope.$watch("geoData", function () {
          renderProjection();
        });  

        // Observar cambios en la región seleccionada
        scope.$watch("selectedRegion", function () {
          placeSelectedRegion();
        });           


        scope.getElementDimensions = function () {
          return { 'h': element[0].clientHeight, 'w': element[0].clientWidth };
        };

        // Observar cambios en el tamaño de la ventana del browser
        scope.$watch(scope.getElementDimensions, function (newValue, oldValue) {
          resizeSvg();
        }, true);

        angular.element($window).bind('resize', function() {
          scope.$apply();
        })

      }
      
      
    };
  }]);
