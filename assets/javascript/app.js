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
        radius: 30
      });

      route.startCircle = new google.maps.Circle({
        strokeColor: '#ff3300',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#ff3300',
        fillOpacity: 0.8,
        map: map,
        center: parsedCoordinates[parsedCoordinates.length - 1],
        radius: 30
      });

      routesArray.push(route);

      renderRoutesList();
    });

    var exampleRouteCoordinates = [
      "29.9846781 31.1433601",
      "29.9848712 31.1428095",
      "29.9846022 31.1420325",
      "29.9868106 31.139105",
      "29.9879353 31.1391736",
      "29.9887626 31.137371",
      "29.9902216 31.132146",
      "29.9911786 31.128874",
      "29.9898586 31.12705",
      "29.9827882 31.1207105",
      "29.9787806 31.111786",
    ];

    $('#coordsList').val(exampleRouteCoordinates.join("\n"))
});

var map;
var mapBounds;
var infoWindow;
var routesArray = [];
var bluredMap = false;
var waitLoadTilesForBlur = false;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  google.maps.event.addListener(map, "maptypeid_changed", function() {
    if( bluredMap ) {
      $('#map .gm-style > div:nth-child(1) > div:nth-child(1)').css('filter', bluredMap ? "blur("+blurIntensity()+"px)" : 'none');
      waitLoadTilesForBlur = true;
    }
  });

  google.maps.event.addListener(map, "tilesloaded", function() {
    if( waitLoadTilesForBlur ) {
      $('#map .gm-style > div:nth-child(1) > div:nth-child(1)').css('filter', 'none');
      triggerBlurMap(false);
    }
  });


  mapBounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();
}

function blurIntensity() {
  return map.getZoom() * 1.3;
}

function triggerBlurMap(toggle)
{
    toggle = (typeof toggle === 'undefined') ? true : toggle;

    if( toggle ) {
      bluredMap = !bluredMap;
    }

    $('#map .gm-style > div:nth-child(1) > div:nth-child(1) div').filter(function () {
        return parseInt($(this).css("z-index")) == 0;
    }).css('filter', bluredMap ? "blur("+blurIntensity()+"px)" : 'none');
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