$.getJSON('../assets/metObjectsVanGogh.json', function(data) {
  // console.log(Object.keys(data['image']).length);
  for (let i=0;i<Object.keys(data['image']).length;i++) {
    let image = data['image'][i]
    let imagePath = 'assets/Images/' + image;
    let imageHTML = "<img src='"+imagePath+"' class='start-stop' id='"+image+"'/>"
    $('.images').append(imageHTML);
  }
})