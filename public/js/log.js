
// TODO: get log data
// TODO: map log data to DOM calendar
// TODO: view existing log entry
// TODO: create/edit log entry (in modal?)
// TODO: save log entry

/**
 * Get log data from REST API
 * E.g. queryParams = {'user': 'me@domain.com', 'from': '2017-08-01', 'to': '2017-09-01'};
 */
getLogEntries = (queryParams) => {
  let url = '/api/log?' + jQuery.param(queryParams);
  console.log(url);

  $.get(url, function(data) {
    return data;
  })
}


/**
 * Render and display modal to reflect data (date, user, existing activities)
 */
drawLogEntryModal = (email, date) => {
  const modal = $('#log-entry-modal');
  const modalTitle = modal.find('.modal-title');
  const modalBody = modal.find('.modal-body');

  const testQueryParams = {
    'user': 'elias.tousley@readingplus.com',
    'from': '2017-08-01',
    'to': '2017-09-01'
  };
  const testData = getLogEntries(testQueryParams);
  console.log(testData);

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
