let dataPromise = d3.json(filePath+'metObjectsVanGogh.json').then(function(paths) {
  // console.log(data);
  let files = [];
  let promises = [];
  for (let p=0;p<Object.keys(paths.image).length;p++) {
    let JSONPath = filePath + "jsonLINE2" + paths.image[p].split(".")[0] + ".json";
    files.push(JSONPath);
  }
  files.forEach(function(url){
    promises.push(d3.json(url));
  })

  Promise.all(promises).then(function(proms) {
    console.log(proms);
  })
});



dataPromise.catch(function(reason) {
  console.log(reason);
});
