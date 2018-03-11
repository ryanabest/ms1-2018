let pace = 500;
let currentYear;

mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w';
let map = L.map('map',{zoomControl:false,attributionControl:false}).setView([10,15], 2);
L.tileLayer(
      'https://api.mapbox.com/styles/v1/ryanabest/cjeans7r303w02ro297dbye1j/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w', {
      // tileSize: 512,
      // zoomOffset: -1,
      attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
// var mapboxLightTileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
//     // attribution: 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
//     maxZoom: 18,
//     // id: 'ryanabest.cjeans7r303w02ro297dbye1j',
//     accessToken: mapboxgl.accessToken
// }).addTo(mymap);
// var mymap = new mapboxgl.Map({
//    container: 'map'
//   ,style: 'mapbox://styles/ryanabest/cjeans7r303w02ro297dbye1j'
//   ,attributionControl:false
//   ,zoom:0.9
// });

// L.marker([48.8588377,2.2770206]).addTo(mymap);
// L.marker([40.6974034,-74.1197633]).addTo(mymap);

// let jsonLINE = [
//   {'lat': 48.8588377, 'lon': 2.2770206}, //Paris
//   {'lat': 40.6974034, 'lon':-74.1197633} //NY
// ];

// https://bost.ocks.org/mike/leaflet/
// let svg = d3.select(map.getPanes().overlayPane).append("svg"),
//           g = svg.append("g").attr("class","leaflet-zoom-hide")

let svgLayer = L.svg();
svgLayer.addTo(map);

/* We simply pick up the SVG from the map object */
let svg = d3.select("#map").select("svg")
     ,g = svg.append("g").attr("class", "leaflet-zoom-hide");

d3.json("assets/jsonLINECezanne.json", function(provenance) {
  /* Add a LatLng object to each item in the dataset */
  provenance.objects.forEach(function(d) {
     d.year = d.line.year
    ,d.latLng = d.line.coordinates
    ,d.cities = d.line.cities
    // d.line.coordinates.forEach(function(d,i) {
    //   console.log(d);
    // });
  })

  let i=0;
  let allData = [];

  for (let a=0;a<provenance.objects.length;a++) {
    // console.log(a);
    // allData = [];
    let data = [];
    for (let b=0;b<provenance.objects[a].latLng.length;b++) {
      let dataPoint = {
        "x": map.latLngToLayerPoint(provenance.objects[a].latLng[b]).x,
        "y": map.latLngToLayerPoint(provenance.objects[a].latLng[b]).y,
        "latLng": provenance.objects[a].latLng[b],
        "year": provenance.objects[a].year,
        "city": provenance.objects[a].cities[b]
      }
      data.push(dataPoint)
      // console.log(provenance.objects[a].year)
      // console.log(provenance.objects[a].cities[b]);
    }
    allData.push({
      'index': a
      ,'data' : data
    })
    let lineFunction = d3.line()
                         .x(function(d) {return d.x})
                         .y(function(d) {return d.y})

    let paths = svg.append('path')
                  .attr('d',lineFunction(data))
                  .attr("fill","none")
                  .attr("stroke","#666666")
                  .attr("stroke-width","3")
                  .attr("opacity","0.4")
                  .attr("stroke-dasharray","0,100")
                  .attr("class","path"+String(a))
                  .attr("id","path"+provenance.objects[a].year)
  }

  let marker = svg.append("circle")
                  .attr("r",7)
                  .attr("id","marker")
                  .attr("fill","red")

  let firstPath = d3.select(".path0");
  let startPoint = pathStartPoint(firstPath);
  let markerLatLng = map.layerPointToLatLng(L.point(parseInt(startPoint.split(",")[0]),parseInt(startPoint.split(",")[1])));

  for (let i=0;i<provenance.objects.length;i++) {
    animate(i);
  }


  map.on("viewreset", reset);
  map.on("zoomend", reset);
  reset();

  // console.log(startPoint);

  function coordToLatLon(coord) {
    var toPoint = map.layerPointToLatLng(new L.Point(coord[0],coord[1]));
    return toPoint;
  }

  function latLonToCoord(point) {
    var toCoord = map.latLngToLayerPoint(new L.Point(point[0],point[1]));
    return toCoord;
  }

  function pathStartPoint(path) {
    // console.log(path.attr("d"))
    let d = path.attr("d"),
        dsplitted = d.split("L");
    return(dsplitted[0].replace("M","").replace("Z",""));
  }

  function animate(x) {
    i=x;
    var path = d3.select('.path'+x).call(transition);
  }

  function tweenDash(d) {
    let l = path.node().getTotalLength();
    let s = d3.interpolateString("0," + l, l + "," + l); //interpolation of stroke-dasharray
    return function(t) {
      let marker = d3.select('#marker');
      let p = path.node().getPointAtLength(t*l);
      markerLatLng = map.layerPointToLatLng(L.point(p));
      marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
      return s(t);
    }
  }

  function transition(path) {
    path.transition()
        .delay(i*pace)
        .duration(pace)
        .attrTween('stroke-dasharray',
          // tweenDash
          function() {
          let l = path.node().getTotalLength();
          let s = d3.interpolateString("0," + l, l + "," + l); //interpolation of stroke-dasharray
          return function(t) {
            let marker = d3.select('#marker');
            let p = path.node().getPointAtLength(t*l);
            markerLatLng = map.layerPointToLatLng(L.point(p));
            marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
            return s(t);
            }
          }
        )
      }


  function reset() {
    // put the marker in the right spot when the map moves
    let markerPoint = map.latLngToLayerPoint(L.latLng(markerLatLng['lat'],markerLatLng['lng']));
    d3.select("#marker")
      .attr("transform","translate(" + markerPoint.x + "," + markerPoint.y + ")") //move marker

    for (let pr=0;pr<allData.length;pr++) { // for all individual paths (one per year)
      for (let prd=0;prd<allData[pr]['data'].length;prd++) {
        allData[pr]['data'][prd].x = map.latLngToLayerPoint(allData[pr]['data'][prd]['latLng']).x; // reset x and y coordinates in the data based on current map composition
        allData[pr]['data'][prd].y = map.latLngToLayerPoint(allData[pr]['data'][prd]['latLng']).y;
      }

      let lineFunction = d3.line() // create new line formula to turn these new x and y coordinates into the format needed for path svg type
                           .x(function(d) {return d.x})
                           .y(function(d) {return d.y})

      let pathReset = d3.select('.path'+pr); // select individual path
      let l = pathReset.node().getTotalLength();
      pathReset.attr('d',lineFunction(allData[pr]['data'])) // reset path location
               .attr('stroke-dasharray',l)
               // .transition()
               // .attrTween('stroke-dasharray',function() {
               //   let l = pathReset.node().getTotalLength();
               //   let s = d3.interpolateString("0," + l, l + "," + l); //interpolation of stroke-dasharray
               //   return s;
               //   // return function(t) {
               //   //   // let marker = d3.select('#marker');
               //   //   let p = path.node().getPointAtLength(t*l);
               //   //   markerLatLng = map.layerPointToLatLng(L.point(p));
               //   //   marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
               //   //   return s(t);
               //   // }
               // });
      console.log(i);
      console.log(pathReset.node().getTotalLength());
      // pathReset.call(transition);


    }
  }
})
