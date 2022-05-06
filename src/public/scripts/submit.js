function submitToSocket(objectData) {
  const data = {
    uri: objectData.getSrc(),
    angle: objectData.getAngle(),
    scaleX: objectData.getScaleX(),
    scaleY: objectData.getScaleY(),
    top: objectData.getTop(),
    left: objectData.getLeft(),
  };

  msgWindow("Submitting...", "loading");

  socket.emit("submitItem", data, function(response) {
    if (response.success) {
      window.onbeforeunload = null;
      canvas.clear();

      msgWindow("🎉 Your changes have been submitted! It is now waiting for approval, check the submissions tab to see it's status...", "success");
    } else if (response.message) {
      msgWindow(response.message, "error");
    } else {
      msgWindow("There was an error submitting your changes. Maybe try another image?", "error");
    }
  });
}