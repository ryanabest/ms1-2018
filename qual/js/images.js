// let filePathImages = '../assets/' // Local Testing
let filePathImages = '/ms1-2018/qual/assets/' // GitHub Pages

let paintingTitle = 'Test'

$.getJSON(filePathImages + 'metObjectsVanGogh.json', function(data) {
  // console.log(data);
  // console.log(Object.keys(data['image']).length);
  for (let i=0;i<Object.keys(data['image']).length;i++) {
    let image = data['image'][i]
    let title = data['title'][i].toLowerCase();
    // let imagePath = 'assets/Images/' + image;
    let imageURL = data['image_url'][i]
    imageURL = imageURL.replace("original","web-large")
    let divID = ''+image+'-div'

    let divText = "<div class='start-stop-div' id='"+image+"-div'></div>"
    let imageHTML = "<img src='"+imageURL+"' class='start-stop' id='"+image+"'/>"
    let titleHTML = "<p class='start-stop-text' id='"+image+"-text'>"+title+"</p>"
    $(divText).appendTo('.images').append(imageHTML).append(titleHTML);
    $(divID).append("<p>TEST</p>");
    // $('.images').append(imageHTML);
  }
})
