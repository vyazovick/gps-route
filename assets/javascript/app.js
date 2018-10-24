$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    $('.remove-routes').on('click', function(e) {
      $.each(routesArray, function(i, route) {
        route.setMap(null);

        google.maps.event.removeListener(route.mouseoverListener);
        google.maps.event.removeListener(route.mouseoutListener);
      });
      routesArray = [];
      renderRoutesList();
    });

    $(document).on('click', '.route', function(e) {
      var route = routesArray[$(this).data('route-index')];

      if (!route) {
        return
      }
      console.log(route);
      coordinates = route.getPath().getArray();

      map.setCenter(coordinates[0]);

      $('.routes li').removeClass('active');
      $(this).parent().addClass('active');
    })

    $('.add-route').on('click', function(e) {
      e.preventDefault();

      var coordsArray = $('#coordsList').val().split("\n");
      var parsedCoordinates = $.map(coordsArray, function(coords) {
        var params = coords.split(' ');

        return new google.maps.LatLng(parseFloat(params[0]), parseFloat(params[1]));
      });

      $.each(parsedCoordinates, function(i, coord) {
        mapBounds.extend(coord);
      });

      map.fitBounds(mapBounds);

      var route = new google.maps.Polyline({
          map: map,
          path: parsedCoordinates,
          strokeColor: "#3399ff",
          strokeOpacity: 1.0,
          strokeWeight: 6
      });
      route.lengthInKm = google.maps.geometry.spherical.computeLength(route.getPath()) / 1000;

      route.mouseoverListener = google.maps.event.addListener(route, 'mouseover', function(e) {
         infoWindow.setPosition(e.latLng);
         infoWindow.setContent("Route distance: " + route.lengthInKm.toFixed(2) + 'km.');
         infoWindow.open(map);
      });
      route.mouseoutListener = google.maps.event.addListener(route, 'mouseout', function() {
         infoWindow.close();
      });

      route.startCircle = new google.maps.Circle({
        strokeColor: '#39e600',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#39e600',
        fillOpacity: 0.8,
        map: map,
        center: parsedCoordinates[0],
        radius: 15
      });

      route.startCircle = new google.maps.Circle({
        strokeColor: '#ff3300',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#ff3300',
        fillOpacity: 0.8,
        map: map,
        center: parsedCoordinates[parsedCoordinates.length - 1],
        radius: 15
      });

      routesArray.push(route);

      renderRoutesList();
    });

    var exampleRouteCoordinates = [
      "49.45324142253338 27.011401854542783",
      "49.453078219537495 27.01148232081323",
      "49.452963837639494 27.011562787083676",
      "49.45284248094111 27.011847101239255",
      "49.45274902213929 27.012056313542416",
      "49.45259697685805 27.0124854669848",
      "49.451984785164946 27.012093924438886",
      "49.45146672072353 27.01173450843089",
      "49.45054720152387 27.011032806743174",
      "49.44900779013253 27.009750710834055",
      "49.445696410950845 27.004804677231505",
      "49.443925695413675 27.009431711073603",
      "49.44158284090015 27.01812557255937",
      "49.439065349421 27.01883377814238",
      "49.43776327205594 27.01889490274948",
      "49.43639026194678 27.01847585296059"
    ];

    $('#coordsList').val(exampleRouteCoordinates.join("\n"))
});
var map;
var mapBounds;
var infoWindow;
var routesArray = [];
var bluredMap = false;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
  mapBounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();
}

function toggleBlurMap()
{
    bluredMap = !bluredMap;
    $('#map .gm-style > div:nth-child(1) > div:nth-child(1) div').filter(function () {
        return parseInt($(this).css("z-index")) == 0;
    }).css('filter', bluredMap ? "blur(15px)" : 'none');
}

function renderRoutesList()
{
    var items = [];
    if( routesArray.length < 1 ) {
      items.push('<li class="active"><a href="#">Empty....</a></li>');
    } else {
      $.each(routesArray, function(i, route) {
        coordinates = route.getPath().getArray();

        items.push('<li><a href="#" class="route" data-route-index="'+i+'">Route #'+(i+1)+' with '+coordinates.length+' points. Distance: ' + route.lengthInKm.toFixed(2) + 'km.</a></li>');
      });
    }

    $('.routes').html('<p>Routes list</p>' + items.join("\n"));
}