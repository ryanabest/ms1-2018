window.vanGoghd3 = function() {
  let paintings = d3.json(filePath + "metObjectsVanGogh.json").then(function(paintings) {

    let data = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    let svg = d3.select("#vanGoghd3-svg").select("svg")
                .attr("width",width)
                .attr("height",height)
         ,g = svg.append("g")
         ,defs = svg.append("svg:defs");

    let circleRadius = 80;
    let menuRadius = height/36;

    init();

    function init() {
      loadCircles();
      drawCircles();
      animateCircles();
    }

    function loadCircles() {
      let y = d3.scalePoint()
                .domain()
      for (let i=0;i<Object.keys(paintings.image).length;i++) {
        let thumbnailPath = paintings.image[i].replace("jpg","png");
        let img = document.createElement("img")
        let imageThumbnail = filePath+'Thumbnails/'+thumbnailPath;
        data.push({
          "objectNumber":paintings.object_number[i],
          "imageSrc":imageThumbnail
        });
        img.src = imageThumbnail;
      }
    }

    function drawCircles() {

      d3.select("#vanGoghd3-svg")
        .selectAll(".circle")
        .data(data)
        .enter().append("img")
          .attr("class","circle")
          .attr("id",function(d) {return "circle-"+d.objectNumber})
          .attr("height",circleRadius*2)
          .attr("src",function(d) {return d.imageSrc})
        .on("click",function() {
          console.log(this.id);
          highlightSelection(this.id.split("-")[1])
        })

      for (let d=0;d<data.length;d++) {
        // console.log(data[d].objectNumber);
        if (d<3) {
          d3.select("#circle-"+data[d].objectNumber)
            .style("z-index","2")
        } else {
          d3.select("#circle-"+data[d].objectNumber)
            .style("z-index","1")
        }
      }
    }

    function highlightSelection(objectNumber) {
      if (paintingSelection===objectNumber) {
        paintingSelection = 0;
      } else {
        paintingSelection = objectNumber;
      }

      d3.select("#vanGoghd3-svg")
        .selectAll(".circle")
        .attr("class",function(d) {
          if (d.objectNumber == paintingSelection) {
            return "circle is-highlighted"
          } else {
            return "circle is-not-highlighted"
          }
          // console.log(d.objectNumber)
        });

      let svg = d3.select("#map").select("svg")
      svg.selectAll(".marker").style("opacity","0");
      svg.selectAll(".path").style("opacity","0");
      svg.select("#marker-"+objectNumber)
         .style("opacity","1");
      svg.select("#path-"+objectNumber)
         .style("opacity","0.5");

      svg.select("#marker-"+objectNumber)
         .style("opacity", function(d) {
           d3.select("#marey-legend")
             .select("h1")
             .text(d.title.split(" (")[0])
           return "1"
         })

      let mareySvg = d3.select("#marey-chart").select("svg");
      mareySvg.selectAll(".marey-line-active").attr("class","marey-line");
      mareySvg.selectAll(".provenance-path-active").attr("class","provenance-path");
      mareySvg.selectAll(".exhibition-circle-active").attr("class","exhibition-circle");

      mareySvg.select("#marey_line_"+paintingSelection).attr("class","marey-line-active");
      mareySvg.selectAll("#provenance_path_"+paintingSelection).attr("class","provenance-path-active provenance_path_"+objectNumber);
      mareySvg.selectAll("#exhibition_circle_"+paintingSelection).attr("class","exhibition-circle-active exhibition_circle_"+objectNumber);
    }

    function animateCircles() {
      d3.selectAll(".circle")
        .transition()
        // .ease(d3.easeQuadInOut)
          .duration(5000)
          .delay(0)
          .on("start",function repeat() {
            d3.active(this)
                .style("left",function(d) {return getRandomInt(width-(3*circleRadius),circleRadius) + "px"})
                .style("top",function(d) {return getRandomInt(height-(3*circleRadius),circleRadius)+ "px"})
              .transition()
              .ease(d3.easeQuadInOut)
                .on("start",repeat);
          })
    }

  })
}
