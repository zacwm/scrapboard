const smBtnAdd = document.getElementById("smBtn_add");
const smBtnSubmissions = document.getElementById("smBtn_submissions");
const smPageAdd = document.getElementById("smPage_add");
const smPageSubmissions = document.getElementById("smPage_submissions");

function smPageSelect(page) {
  // remove from all, just to make if statements smaller...
  smBtnSubmissions.classList.remove("active");
  smPageSubmissions.classList.remove("active");
  smBtnAdd.classList.remove("active");
  smPageAdd.classList.remove("active");

  if (page === "add") {
    smBtnAdd.classList.add("active");
    smPageAdd.classList.add("active");
  } else if (page === "submissions") {
    smBtnSubmissions.classList.add("active");
    smPageSubmissions.classList.add("active");
  }
}

smBtnAdd.addEventListener("click", function(e) {
  smPageSelect("add");
});

smBtnSubmissions.addEventListener("click", function(e) {
  smPageSelect("submissions");
});