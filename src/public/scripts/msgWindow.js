var elemMsgWindow = document.getElementById("msgWindow");
var mwTitle = document.getElementById("msgWindowTitle");
var mwText = document.getElementById("msgWindowText");
var elemBtnMsgWindowClose = document.getElementById("btnMsgWindowClose");

function msgWindow(msg, type) {
  elemBtnMsgWindowClose.style.display = "block";

  if (type === "success") {
    mwTitle.innerHTML = "Success!";
  } else if (type === "loading") {
    mwTitle.innerHTML = "Loading...";
    elemBtnMsgWindowClose.style.display = "none";
  } else {
    mwTitle.innerHTML = "Error!";
  }

  mwText.innerHTML = msg;
  elemMsgWindow.style.display = "flex";
}

document.getElementById("btnMsgWindowClose")
  .addEventListener("click", function(e) {
    document.getElementById("msgWindow").style.display = "none";
  });