let dataPromise = d3.json(filePath+'metObjectsVanGogh.json').then(function(data) {
  console.log(data);
});

dataPromise.catch(function(reason) {
  console.log(reason);
});
