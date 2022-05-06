socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."
});

socket.on("disconnect", () => {
  socket.connect();
});