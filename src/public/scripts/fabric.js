// fabric.js not the fabric mod loader - LOOOL IM SO FUNNY.

var canvas = new fabric.Canvas('canvasBanner');

canvas.setHeight(360);
canvas.setWidth(900);
canvas.backgroundColor="#fff";

fabric.Image.fromURL(initialBanner, function(img) {
  canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
    scaleX: canvas.width / img.width,
    scaleY: canvas.height / img.height
  });
});

canvas.renderAll();

// File selector
document.getElementById("inputImage")
  .addEventListener("change", function(e) {
    
    // Enables the confirm leave due to made changes...
    window.onbeforeunload = function() {
      return true;
    };

    // Clears the canvas for any other existing items...
    canvas.clear();

    // Gets the file from the input and adds it to the canvas...
    var file = e.target.files[0];
    if (file.size > 2097152) {
      msgWindow("This file is too big, and won't submit. Try a smaller image.", "error");
      return;
    }

    var reader = new FileReader();
    reader.onload = function(f) {
      var data = f.target.result;
      fabric.Image.fromURL(data, function(imgData) {
        let imgScaler = Math.min(canvas.width / imgData.width, canvas.height / imgData.height);
        if (imgScaler >= 1) imgScaler = 1;
        var img1 = imgData.set({
          top: 0,
          left: 0,
          height: imgData.height,
          width: imgData.width,
          scaleX: imgScaler,
          scaleY: imgScaler,
        });
        canvas.add(img1); 
      });
    };
    reader.readAsDataURL(file);
  });

// Submit button
document.getElementById("submitButton")
  .addEventListener("click", function(e) {
    const objects = canvas.getObjects();
    if (objects.length !== 1) {
      msgWindow("You need to add an image to the canvas before submitting.");
    }
    submitToSocket(objects[0]);
  });

// Socket Testing
socket.on("canvasChange", function (data) {
  fabric.Image.fromURL(data.uri, function(img) {
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      scaleX: canvas.width / img.width,
      scaleY: canvas.height / img.height
    });
  });
  canvas.renderAll();
});

socket.on("itemImport", function (data) {
  canvas.clear();
  fabric.Image.fromURL(data.uri, function(imgData) {
    let imgScaler = Math.min(canvas.width / imgData.width, canvas.height / imgData.height);
    if (imgScaler >= 1) imgScaler = 1;
    var img1 = imgData.set({
      top: data.top,
      left: data.left,
      height: imgData.height,
      width: imgData.width,
      scaleX: data.scaleX,
      scaleY: data.scaleY,
      angle: data.angle,
    });
    canvas.add(img1); 
  });
});