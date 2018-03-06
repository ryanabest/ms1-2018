let pace = 250;
let currentYear;

mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w';
// let map = L.map('map',{zoomControl:false,attributionControl:false}).setView([40,10], 3);
let map = L.map('map',{zoomControl:false,attributionControl:false}).fitBounds(L.latLngBounds(L.latLng(69,150),L.latLng(-9,-131)));
// $("#map").height($(window).height()*0.4).width($(window).width()*0.7);
// map.invalidateSize();
L.tileLayer(
      'https://api.mapbox.com/styles/v1/ryanabest/cjeans7r303w02ro297dbye1j/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w', {
      // tileSize: 512,
      // zoomOffset: -1,
      attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
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
    ,d.owner = d.line.owner
    ,d.changeFlag = d.line.changeFlag
    // d.line.coordinates.forEach(function(d,i) {
    //   console.log(d);
    // });
  })

  let allData = [];

  for (let a=0;a<provenance.objects.length;a++) {
    // console.log(a);
    // allData = [];
    let data = [];
    for (let b=0;b<provenance.objects[a].latLng.length;b++) {
      let dataPoint = {
         "x": map.latLngToLayerPoint(provenance.objects[a].latLng[b]).x
        ,"y": map.latLngToLayerPoint(provenance.objects[a].latLng[b]).y
        ,"latLng": provenance.objects[a].latLng[b]
        ,"year": provenance.objects[a].year
        ,"city": provenance.objects[a].cities[b]
        ,"owner": provenance.objects[a].owner[b]
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
                  .attr("stroke","#EC0031")
                  .attr("stroke-width","2")
                  .attr("opacity","0")
                  // .attr("stroke-dasharray","0,100")
                  .attr("class","path"+String(a))
                  .attr("id","path"+provenance.objects[a].year)
  }

  let marker = svg.append("circle")
                  .attr("r",7)
                  .attr("id","marker")
                  .attr("fill","#EC0031")

  // var i=14;
  iterate();

  function iterate() {
    // for (let i=21;i<22;i++) {
    for (let i=0;i<provenance.objects.length;i++) {
      let path=svg.select(".path" + i).call(transition);

      function transition(path) {
        path.transition()
            .delay(pace*i)
            .duration(pace)
            .attr("style","opacity:.3")
            .attrTween('stroke-dasharray',tweenDash)
            .on("start",function() {
              $("#current-year").text("Current Year: " + provenance.objects[i].year);
              if (provenance.objects[i].changeFlag === 1) {
                let divID = 'year-' + provenance.objects[i].year;
                // $('#container').append("<div id=year-"+h1Var+">"+provenance.objects[i].year+"</h1>")
                let divText = "";
                divText += "<br><div class=flex-div id="+divID+">"
                divText += "<h1>"+provenance.objects[i].year+"</h1>";
                divText += "<ol>"
                let olItems = '';
                for (let x=0;x<provenance.objects[i].cities.length;x++) {
                  olItems += "<li>" + provenance.objects[i].owner[x] + " (" + provenance.objects[i].cities[x] + ")</li>"
                  // console.log(li);
                }
                divText += olItems
                divText += "</ol></div>"
                // console.log(olItems);
                $('.container').append(divText)
                // for (let x=0;x<provenance.objects)

                // console.log(provenance.objects[i].cities.length)
                // console.log(provenance.objects[i].owner)
              }
            })

        function tweenDash(d) {
          let l = path.node().getTotalLength();
          let s = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
          return function (t) {
            let marker = d3.select("#marker");
            let p = path.node().getPointAtLength(t * l);
            marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker
            // map.panTo(L.point(p.x,p.y))
            return s(t);
            }
          }
      }
    }
  }

  function reset() {

  }
})
