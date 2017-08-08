
// Global variables used by multiple functions
const CSRF_HEADER = 'X-CSRF-Token';

let modal = $('#log-entry-modal');
let modalDate = modal.find('.entry-date');
let modalTitle = modal.find('.entry-title-input');
let modalActivityButton = modal.find('#btn-activity');
let modalDescription = modal.find('.entry-description-input');
let modalDurationValue = modal.find('.entry-duration-value-input');
let activeEntryData = {};


/**
 * Set AJAX prefilter so that HTTP requests get through Express.js CSRF protection
 * Credit: https://stackoverflow.com/a/18041849
 */
setCSRFToken = (securityToken) => {
  jQuery.ajaxPrefilter(function (options, _, xhr) {
    if (!xhr.crossDomain) {
      xhr.setRequestHeader(CSRF_HEADER, securityToken);
    }
  });
};


/**
 * Get log data from REST API, then draw them to calendar
 */
fillLogEntries = () => {
  const dayElems = $('.fc-day');
  const email = window.location.href.split('/')[-1];
  const startDate = dayElems[0].dataset.date;
  const endDate = dayElems[dayElems.length - 1].dataset.date;
  const getLogEntriesUrl = '/api/log?' + jQuery.param({
    "email": email,
    "from": startDate,
    "to": endDate
  });
  let entryElem = undefined;


  // Map data to calendar days
  // Could probably do this more efficiently...
  $.get(getLogEntriesUrl, function(data) {
    for (entry of data.data) {
      for (dayElem of dayElems) {
        if (entry.date.slice(0, 10) === dayElem.dataset.date) {
          entryElem = document.createElement("button");
          entryElem.className = "btn btn-sm btn-primary log-entry-btn";
          entryElem.textContent = entry.title || (entry.activity + " (" + entry.durationValue + " " + entry.durationUnit + "s)");;

          // Add data as data-foo attributes to the event element (there's probably a better way...)
          for (let [key, value] of Object.entries(entry)) {
            entryElem.dataset[key] = value;
          }

          dayElem.appendChild(entryElem);
          break;
        }
      }
    }
  });
}


/**
 * Render and display modal to reflect data (date, user, existing activities)
 */
drawLogEntryModal = (clickedDayElem) => {
  modalDate.html( activeEntryData.date.slice(0, 10) );
  modalTitle.val(activeEntryData.title);
  modalActivityButton.html(activeEntryData.activity);
  modalActivityButton.val(activeEntryData.activity);
  modalDescription.val(activeEntryData.description);
  modalDurationValue.val(activeEntryData.durationValue);

  modal.modal('show');
};


/**
 * Create or update log entry
 */
 saveLogEntry = () => {
   const newEntryData = {
     "date": activeEntryData.date,
     "title": modalTitle.val(),
     "activity": modalActivityButton.html(),
     "description": modalDescription.val(),
     "durationValue": modalDurationValue.val()
   };
   updateActiveEntryData(newEntryData);

   if (activeEntryData._id) {
     // If there's already an _id, do a PUT (update)
     $.ajax({
       url: '/api/log/' + activeEntryData._id,
       type: 'PUT',
       data: {"data": activeEntryData},
       success: function(data) {
         console.log('Updated entry: ' + JSON.stringify(activeEntryData));
       }
     });
   } else {
     // If there's no _id, do a POST (create)
     $.ajax({
       url: '/api/log/',
       type: 'POST',
       data: {"data": activeEntryData},
       success: function(data) {
         console.log('Created entry: ' + JSON.stringify(activeEntryData));
       }
     });
   }
 };


 /**
  * Update activeEntryData to reflect current state of log entry modal
  */
updateActiveEntryData = (newEntryData) => {
  if (newEntryData === undefined || Object.keys(newEntryData).length === 0) {
    console.log("Missing newEntryData: " + newEntryData);
    return;
  }
  for ( let [key, val] of Object.entries(newEntryData) ) {
    activeEntryData[key] = val;
  };
};


/**
 * Do stuff when page loads
 */
$(document).ready(function() {
  setCSRFToken($('meta[name="csrf-token"]').attr('content'));

  // Hide modal
  $('#log-entry-modal').modal('hide');

  // Draw calendar
  $('#calendar').fullCalendar({
    // put options and callbacks here
  });

  // Retrieve and insert log entries for visible date range
  // TODO: this should also get called when month arrows are clicked
  fillLogEntries();

  // Show log entry when date is clicked
  $('.fc-day, .fc-day-top, .log-entry-btn').on('click touch', function () {
    event.stopPropagation();  // Need this to click on an entry button inside a clickable day cell
    updateActiveEntryData(event.target.dataset);
    drawLogEntryModal(event.target);
  });

  // Save log entry when Save button is clicked
  $('.save-entry').on('click touch', function() {
    saveLogEntry();
  });

  // Update selected value (and html) when a dropdown option is clicked
  $('#activity-dropdown li > a').on('click touch', function() {
    $('#btn-activity').html(this.innerHTML);
    $('#btn-activity').val(this.innerHTML);
  });
});
