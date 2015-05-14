# Comunas de Chile con D3 & Angular
Sitio base para trabajar despliegue de información en mapa de comunas de Chile

Se cargan datos con la definición geográfica de todas las comunas de Chile en formato topojson (data/comunas.json). En este archivo cada comuna tiene asociado un identificador único (Ej. Pica es 01405).

Tambiñen se cargan datos con distintas propiedades o atributos de las comunas desde un archivo de texto separado por tabs: data/datosComunas.tsv.  Este archivo puede tener un numero indefinido de columnas (cada columna es un atributo de la comuna), pero debe existir una que se llame codigo_comuna, y que corresponde al respectivo id de la comuna (este puede omitir el 0 inicial).

##Instalación
Para instalar las libreriías y componentes de javascript se requiere tener instaldo bower y ejecutar:

bower install

Esto instalará el conjunto de librerías de Javascript de las cuales depende el código en la carpeta "bower_components"

##Archivos
app.js - Definición de la App de Angular (tideApp)
controller.js - Controlador que maneja la comunicación de datos con la vista
directive.js - Definición de la directiva "td-mapa-interactivo" que permite desplegar el mapa de comunas en html
index.html - Archivo html que incorpora el elemento "td-mapa-interactivo"
main.css - Definición de estilos (en particular los estilos del tooltip)
service.js - Servicio que maneja la carga de archivos de datos y es llamado desde el controlador

##Configuración de regiones
La información geográficas del archivo comunas.json no contiene definiciones de las Regiones ni Provincias (sólo las comunas).  Para poder desplegar el mapa centrado en una región específica es necesario definir parámetros de desplazameinto y zoom del elemento que contiene el mapa con las comunas.  Esta información se define en el arreglo "regiones" al interior del controlador

En controller.js se define el arreglo this.regiones que contiene información básica de las 15 Regiones (numero, nombre, pos & zoom).

zoom: corresponde a un factor de zoom del elemento que contiene el mapa de comunas
pos: corresponde a un desplazmiento (en puntos) de las coordenadas x e y del elemento que contiene el mapa de comunas
Ambos datos permiten presentar la información de la Región centrada en el despliegue.

En la directiva "td-mapa-interactivo" se define que la región seleccionada en el controlador (this.selectdRegion) será centrada y desplegada con un color distinto por cada comuna.  Las comunas de las regiones que no sean la seleccionada se despelgarán en blanco un con un factor de opacidad de 0.2.

Para asociar las comunas a las regiones, el archivo de datos "data/datosComunas.tsv" debe contener una columna llamada "codigo_region" con el número de región correpondiente (numero correspondiente al atributo "numero"del arreglo this.regiones.

Si se desea colorear las comunas de acuerdo a su provincia y no a la comuna, se necesita incluir una columna con un identificador de la provincia en el archivo "data/datosComunas.tsv"




