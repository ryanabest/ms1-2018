window.vanGoghd3 = function() {
  let paintings = d3.json(filePath + "metObjectsVanGogh.json").then(function(paintings) {

    let data = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    // console.log(paintings);

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
        data.push(paintings.object_number[i]);
        let thumbnailPath = paintings.image[i];
        let img = document.createElement("img")
        let imageThumbnail = filePath+'Thumbnails/'+thumbnailPath;
        img.src = imageThumbnail;
        let pattern = defs.append("svg:pattern")
                          .attr("id","pattern-"+paintings.object_number[i])
                          .attr("x","0")
                          .attr("y","0")
                          .attr("width","1")
                          .attr("height","1")
                          .attr("patternUnits","objectBoundingBox")
                          .append("svg:image")
                          .attr("xlink:href",imageThumbnail)
                          .attr("width",circleRadius*2)
                          .attr("height",circleRadius*2)

        let menuPattern = defs.append("svg:pattern")
                          .attr("id","menu-pattern-"+paintings.object_number[i])
                          .attr("x","0")
                          .attr("y","0")
                          .attr("width","1")
                          .attr("height","1")
                          .attr("patternUnits","objectBoundingBox")
                          .append("svg:image")
                          .attr("xlink:href",imageThumbnail)
                          .attr("width",menuRadius*2)
                          .attr("height",menuRadius*2)
      }
    }

    function drawCircles() {
      let data1 = []
      let data2 = []
      for (let d=0;d<data.length;d++) {
        if (d<3) {
          data2.push(data[d]);
        } else {
          data1.push(data[d]);
        }
      }

      svg.selectAll(".circle1")
         .data(data1)
         .enter()
         .append("circle")
           .attr("cx",function(d) {return getRandomInt(width-(2*circleRadius),circleRadius)})
           .attr("cy",function(d) {return getRandomInt(height-(2*circleRadius),circleRadius)})
           .attr("r",circleRadius)
           .attr("fill",function(d) {return "url(#pattern-"+d+")"})
           .attr("class","circle")
           .attr("id",function(d) {return "circle-"+d})
        .on("click",function() {
          console.log(this.id);
          highlightSelection(this.id.split("-")[1])
        });

      svg.append("text")
         .attr("x",width/2)
         .attr("y",height/4)
         .attr("text-anchor","middle")
         .attr("class","title-text")
         .attr("fill","rgb(10,10,10)")
         .attr("id","title-text-1")
         .text("The")

      svg.append("text")
         .attr("x",width/2)
         .attr("y",height/2)
         .attr("text-anchor","middle")
         .attr("class","title-text")
         .attr("fill","rgb(10,10,10)")
         .attr("id","title-text-2")
         .text("Migration")

      svg.append("text")
         .attr("x",width/2)
         .attr("y",3*height/4)
         .attr("text-anchor","middle")
         .attr("class","title-text")
         .attr("fill","rgb(10,10,10)")
         .attr("id","title-text-3")
         .text("of  Art")

      svg.selectAll(".circle2")
         .data(data2)
         .enter()
         .append("circle")
           .attr("cx",function(d) {return getRandomInt(width-(2*circleRadius),circleRadius)})
           .attr("cy",function(d) {return getRandomInt(height-(2*circleRadius),circleRadius)})
           .attr("r",circleRadius)
           .attr("fill",function(d) {return "url(#pattern-"+d+")"})
           .attr("class","circle")
           .attr("id",function(d) {return "circle-"+d})
        .on("click",function() {
          console.log(this.id);
          highlightSelection(this.id.split("-")[1])
        });
    }

    function highlightSelection(objectNumber) {
      if (paintingSelection===objectNumber) {
        paintingSelection = 0;
      } else {
        paintingSelection = objectNumber;
      }

      let svg = d3.select("#map").select("svg")
      svg.selectAll(".marker").style("opacity","0");
      svg.selectAll(".path").style("opacity","0");
      svg.select("#marker-"+objectNumber)
         .style("opacity","1");
      svg.select("#path-"+objectNumber)
         .style("opacity","0.5");

      let mareySvg = d3.select("#marey-chart").select("svg");
      mareySvg.selectAll(".marey-line").style("opacity","0");
      mareySvg.selectAll(".provenance-path").style("opacity","0");
      mareySvg.selectAll(".exhibition-circle").style("opacity","0");

      mareySvg.select("#marey_line_"+objectNumber).style("opacity","1");
      mareySvg.selectAll(".provenance_path_"+objectNumber).style("opacity","1");
      mareySvg.selectAll(".exhibition_circle_"+objectNumber).style("opacity","1");
    }

    function animateCircles() {
      d3.selectAll(".circle")
        .transition()
        // .ease(d3.easeQuadInOut)
          .duration(5000)
          .delay(0)
          .on("start",function repeat() {
            d3.active(this)
                .attr("cx",function(d) {return getRandomInt(width-(2*circleRadius),circleRadius)})
                .attr("cy",function(d) {return getRandomInt(height-(2*circleRadius),circleRadius)})
              .transition()
              .ease(d3.easeQuadInOut)
                .on("start",repeat);
          })
    }
  })
}
