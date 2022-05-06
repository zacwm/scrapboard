$(document).ready(runSubmissionData);

socket.on("submissionUpdate", function(data) {
  submissionData = data.submissions;
  runSubmissionData();
});

function runSubmissionData() {
  const submissionPendingCount = $("#submissionPendingCount");
  const parentElem = $("#submissionItemsParent");

  submissionPendingCount.text(submissionData.filter(submission => submission.status === "pending").length);
  parentElem.html("");

  for (let i = 0; i < submissionData.length; i++) {
    const submissionItem = submissionData[i];
    
    parentElem.append(`
      <div class="submissionEntry">
        <div class="submissionEntry__status">
          <span class="${submissionItem.status}">&#9673;</span>
        </div>
        <div class="submissionEntry__image" style="background-image: url('${submissionItem.image}')"></div>
        <div class="submissionEntry__info">
          <p class="submissionEntry__info__title">By: ${submissionItem.by}</p>
          <p class="submissionEntry__info__date">Date: ${moment.unix(submissionItem.date).format("MM/DD/YYYY hh:mm a")}</p>
        </div>
      </div>
    `)
  }
}