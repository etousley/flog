
// TODO: view existing log entry
// TODO: create/edit log entry (in modal?)
// TODO: save log entry


/**
 * Get log data from REST API, then draw them to calendar
 */
fillLogEntries = () => {
  const dayElems = $('.fc-day');
  const email = window.location.href.split("/").slice(-1)[0];
  const startDate = dayElems[0].dataset.date;
  const endDate = dayElems[dayElems.length - 1].dataset.date;
  const ignoreDataKeys = {'_id': 1, 'user': 1}
  let entryTitle = undefined;
  let entryElem = undefined;

  // Build query parameters for GET request
  const url = '/api/log?' + jQuery.param({
    "email": email,
    "from": startDate,
    "to": endDate
  });

  // Map data to calendar days
  // Could probably do this more efficiently...
  $.get(url, function(data) {
    for (entry of data.data) {
      for (dayElem of dayElems) {
        if (entry.date.slice(0, 10) === dayElem.dataset.date) {
          entryTitle = entry.title || (entry.activity + " (" + entry.durationValue + " " + entry.durationUnit + "s)");
          entryElem = document.createElement("div");
          entryElem.className = "log-entry-title";
          entryElem.textContent = entryTitle;

          // Add data as data-foo attributes to the event element (probably a better way...)
          for (let [key, value] of Object.entries(entry)) {
            if ( !(key in ignoreDataKeys) )  {
              entryElem.dataset[key] = value;
            }
          }

          dayElem.appendChild(entryElem);
          break;
        }
      }
    }
  })
}


/**
 * Render and display modal to reflect data (date, user, existing activities)
 */
drawLogEntryModal = (clickedDayElem) => {
  const entryElem = clickedDayElem.find('.log-entry-title')[0];
  let modal = $('#log-entry-modal');
  let modalDate = modal.find('.entry-date');
  let modalTitle = modal.find('.entry-title-input');
  let modalActivity = modal.find('.entry-activity-input');
  let modalDurationValue = modal.find('.entry-duration-value-input');
  let modalDescription = modal.find('.entry-description-input');

  modalDate.html( entryElem.dataset.date.slice(0, 10) );
  modalTitle.val(entryElem.dataset.title);
  modalActivity.html(entryElem.dataset.activity); // TODO: this is wrong
  modalDurationValue.val(entryElem.dataset.durationValue);
  modalDescription.val(entryElem.dataset.description);

  modal.modal('show');
};


/**
 * Do stuff when page loads
 */
$(document).ready(function() {
  let visibleDates = undefined;

  // Hide modal
  $('#log-entry-modal').modal('hide');

  // Draw calendar
  $('#calendar').fullCalendar({
    // put options and callbacks here
  });

  // Retrieve and insert log entries for visible date range
  // TODO: this should also get called when month arrows are clicked
  fillLogEntries();

  $('.fc-day').on('click touch', function () {
    const clickedDayElem = $(this);

    // Mark active day
    $('.fc-day').removeClass('active');
    clickedDayElem.addClass('active');

    drawLogEntryModal(clickedDayElem);
    // $('#log-entry-modal').modal('show');
  });
});
