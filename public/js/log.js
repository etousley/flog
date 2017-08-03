
// TODO: get log data
// TODO: map log data to DOM calendar
// TODO: view existing log entry
// TODO: create/edit log entry (in modal?)
// TODO: save log entry

/**
 * Render and display modal to reflect data (date, user, existing activities)
 */
exports.drawLogEntryModal = (email, date) => {
  const modal = $('#log-entry-modal');
  const modalTitle = modal.find('.modal-title');
  const modalBody = modal.find('.modal-body');
  let user = undefined;
  let isOwner = undeined;

  fetch('/log/' + )


  modalTitle.html('Log: ' + data.date);

  modal.modal('show');
};




$(document).ready(function() {
  // Hide modal
  $('#log-entry-modal').modal('hide');

   // Draw calendar
  $('#calendar').fullCalendar({
    // put options and callbacks here
  });

  $('.fc-day').on('click touch', function () {
    const clickedDate = $(this).attr('data-date');

    // Mark active day
    $('.fc-day').removeClass('active');
    $(this).addClass('active');

    drawLogEntryModal(clickedDate);
    // $('#log-entry-modal').modal('show');
  });
});
