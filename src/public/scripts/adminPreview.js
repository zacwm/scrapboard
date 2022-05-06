$(document).ready(function() {
  runSubmissionView();
});

function runSubmissionView() {
  const parentElem = $("#submissionList");
  parentElem.html("");

  const pendingOnly = submissionData.filter(submission => submission.status === "pending").sort((a, b) => b.unix - a.unix);
  const allOthers = submissionData.filter(submission => submission.status !== "pending").sort((a, b) => b.unix - a.unix);

  for (let i = 0; i < pendingOnly.length; i++) {
    const submissionItem = pendingOnly[i];
    
    parentElem.append(`
      <div class="slItem">
        <div class="slItem__details">
          <p>User: ${submissionItem.name} (${submissionItem.user.discordID})</p>
          <p>Date: ${moment.unix(submissionItem.unix).format("MM/DD/YYYY hh:mm a")}</p>
          <p>ID: ${submissionItem._id}</p>
        </div>
        <button class="btnView" onclick="adminViewSubmission('${submissionItem._id}')">view</button>
        <div class="slItem__actions">
          <button onclick="adminSaveSubmission('${submissionItem._id}')">save</button>
          <button onclick="adminDenySubmission('${submissionItem._id}')">deny</button>
        </div>
      </div>
    `)
  }
  parentElem.append(`<hr />`)
  for (let i = 0; i < allOthers.length; i++) {
    const submissionItem = allOthers[i];
    
    parentElem.append(`
      <div class="slItem ${submissionItem.status}">
        <div class="slItem__details">
          <p>User: ${submissionItem.name} (${submissionItem.user.discordID})</p>
          <p>Date: ${moment.unix(submissionItem.unix).format("MM/DD/YYYY hh:mm a")}</p>
          <p>ID: ${submissionItem._id}</p>
        </div>
        <button class="btnView" onclick="adminViewSubmission('${submissionItem._id}')">view</button>
      </div>
    `)
  }
}

function adminSaveImage() {
  window.open(canvas.toDataURL());
}

function adminViewSubmission(id) {
  canvas.clear();

  const submission = submissionData.find(s => s._id === id);

  fabric.Image.fromURL(submission.uri, function(imgData) {
    imgData.crossOrigin = "anonymous";
    let imgScaler = Math.min(canvas.width / imgData.width, canvas.height / imgData.height);
    if (imgScaler >= 1) imgScaler = 1;
    var img1 = imgData.set({
      top: submission.top,
      left: submission.left,
      height: imgData.height,
      width: imgData.width,
      scaleX: submission.scaleX,
      scaleY: submission.scaleY,
      angle: submission.angle,
    });
    canvas.add(img1); 
  });
}

function adminSaveSubmission(id) {
  const confirm = window.confirm("Are you sure you want to save this submission?");
  if (!confirm) return;

  canvas.deactivateAll().renderAll();

  const submission = submissionData.find(s => s._id === id);

  msgWindow("Waiting for server...", "loading");
  socket.emit("adminNewBanner", {
    submissionID: submission._id,
    newBannerURI: canvas.toDataURL(),
  }, (data) => {
    msgWindow("Submission has been accepted.", "success");
  });
}

function adminDenySubmission(id) {
  const confirm = window.confirm("Are you sure you want to save this submission?");
  if (!confirm) return;

  const submission = submissionData.find(s => s._id === id);

  msgWindow("Waiting for server...", "loading");
  socket.emit("adminDeny", {
    submissionID: submission._id,
  }, (data) => {
    msgWindow("Submission has been denied.", "success");
  });
}

socket.on("adminSubmissionUpdate", function(data) {
  $("#submissionCount").text(data.submissions.filter(submission => submission.status === "pending").length);
  submissionData = data.submissions;
  runSubmissionView();
});