// let filePathImages = '../assets/' // Local Testing
let filePathImages = '/ms1-2018/qual/assets/' // GitHub Pages

$.getJSON(filePathImages + 'metObjectsVanGogh.json', function(data) {
  // console.log(Object.keys(data['image']).length);
  for (let i=0;i<Object.keys(data['image']).length;i++) {
    let image = data['image'][i]
    // let imagePath = 'assets/Images/' + image;
    let imageURL = data['image_url'][i]
    imageURL = imageURL.replace("original","web-large")
    let imageHTML = "<img src='"+imageURL+"' class='start-stop' id='"+image+"'/>"
    $('.images').append(imageHTML);
  }
})
