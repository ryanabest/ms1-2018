let dataPromise = d3.json(filePath+'metObjectsVanGogh.json',function(error,paths) {
  for (let p=0;p<Object.keys(paths.image).length;p++) {
    let JSONPath = filePath + "jsonLine2" + paths.image[p].split(".")[0] + ".json";
    d3.json(JSONPath,function(error,proms) {
      console.log(proms);
    })
  }
});
