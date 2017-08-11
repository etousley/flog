

// Global variables used by multiple functions
const CSRF_HEADER = 'X-CSRF-Token';

let modal = $('#log-entry-modal');
let modalAlert = $('.modal-alert');
let modalDateField = modal.find('.entry-date');
let modalTitleField = modal.find('.entry-title-field');
let modalActivityField = modal.find('#btn-activity');
let modalDescriptionField = modal.find('.entry-description-field');
let modalDurationValueField = modal.find('.entry-duration-value-field');
let modalDurationUnitField = modal.find('.entry-duration-unit');
let modalPointsField = modal.find('.entry-points-field');
let modalSaveButton = modal.find('.save-entry');
let modalDeleteButton = modal.find('.delete-entry');
let activeEntryElem = undefined;
let userEmail = undefined;

const calendarOptions = {
  contentHeight: 'auto'
}


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
  // Draw calendar
  $('#calendar').fullCalendar({
    calendarOptions
  });

  const dayElems = $('.fc-day')
  const startDate = dayElems[0].dataset.date;
  const endDate = dayElems[dayElems.length - 1].dataset.date;
  const getLogEntriesUrl = '/api/log?' + jQuery.param({
    "email": userEmail,
    "from": startDate,
    "to": endDate
  });
  $.get(getLogEntriesUrl, function(data) {
    for (let entryData of data.data) {
      addEntryElem(entryData);
    }
  });
};


/**
 * Render and display modal to reflect data (date, user, existing activities)
 */
drawLogEntryModal = (clickedDayElem) => {
  console.log('in drawLogEntryModal, activeEntryElem: ');
  console.log( activeEntryElem);

  const activityName = activeEntryElem.dataset.activity;
  let targetActivity = undefined;

  modalDateField.html( activeEntryElem.dataset.date.slice(0, 10) );
  modalTitleField.val(activeEntryElem.dataset.title);
  modalDescriptionField.val(activeEntryElem.dataset.description);
  modalDurationValueField.val(activeEntryElem.dataset.durationValue);

  updateModalPoints(activeEntryElem.dataset);

  if (activityName !== undefined && activityName !== 'Activity') {
    targetActivity = $(".dropdown-item:contains('" + activityName + "')")[0];
    modalDurationUnitField.val(targetActivity.dataset.durationUnit) + 's';
    updateElemDataset(modalActivityField, targetActivity.dataset);
    modalActivityField.val(targetActivity);
    modalActivityField.text(activityName);
  }

  if (activeEntryElem && activeEntryElem.dataset._id !== undefined) {
    modalDeleteButton.prop("disabled", false);
  }

  modal.modal('show');
};


/**
 * Create or update log entry
 */
 saveLogEntry = () => {

   updateElemDataset(activeEntryElem, {
     "title": modalTitleField.val(),
     "user": userEmail,
     "activity": modalActivityField.html(),
     "description": modalDescriptionField.val(),
     "durationValue": modalDurationValueField.val(),
     "durationUnit": modalActivityField.dataset.durationUnit,
     "category": modalActivityField.dataset.category
   });
   updateEntryTitle(activeEntryElem.dataset);

   if (activeEntryElem.dataset._id !== undefined) {
     // If there's already an _id, do a PUT (update)
     $.ajax({
       url: '/api/log/' + activeEntryElem.dataset._id,
       type: 'PUT',
       data: {"data": activeEntryElem.dataset},
       success: function(data) {
         let updatedEntry = data.data;
         updateModalPoints(updatedEntry);
         modalAlert.text('Updated entry');
         modalAlert.show();
         console.log('Updated entry: ' + JSON.stringify(updatedEntry));
       }
     });
   } else {
     // If there's no _id, do a POST (create)
     $.ajax({
       url: '/api/log/',
       type: 'POST',
       data: {"data": activeEntryElem.dataset},
       success: function(data) {
         let createdEntry = data.data;
         updateModalPoints(createdEntry);
         addEntryElem(createdEntry);
         modalDeleteButton.prop("disabled", false);
         modalAlert.text('Added new entry');
         modalAlert.show();
         console.log('Created entry: ' + JSON.stringify(createdEntry));
       }
     });
   }
 };


 /**
  * Delete log entry
  */
 deleteLogEntry = () => {
   $.ajax({
     url: '/api/log/' + activeEntryElem.dataset._id,
     type: 'DELETE',
     success: function(data) {
       activeEntryElem.remove();
       activeEntryElem.dataset = {};
       modalDeleteButton.prop("disabled", true);
       modalAlert.text('Deleted entry');
       modalAlert.show();
       console.log('Deleted entry');
     }
   });
 }


/**
 * Add new entry element to calendar day. Entry element should have data- attrs
 */
addEntryElem = (entryData) => {
  const entryDate = entryData.date.slice(0, 10);
  const dayElem = document.querySelectorAll(`.fc-day[data-date='${entryDate}']`)[0];
  activeEntryElem = document.createElement("div");

  activeEntryElem.className = "btn btn-sm btn-primary log-entry-btn";
  modalPointsField.val(entryData.points);

  updateEntryTitle(entryData);
  updateElemDataset(activeEntryElem, entryData);

  dayElem.appendChild(activeEntryElem);

  // Make sure week row is big enough to hold all the entries :P
  const thisRow = dayElem.parentElement.parentElement.parentElement.parentElement.parentElement;
  const thisRowHeightPx = parseInt(thisRow.style.height.replace('px', ''));
  const dayEntries = dayElem.querySelectorAll('.log-entry-btn');
  let totalHeight = 0;
  for (let elem of dayEntries) {
    totalHeight += elem.clientHeight;
  }
  if (thisRowHeightPx < (totalHeight + 60)) {
    thisRow.style.height = (totalHeight + 60) + 'px';
  }
};


/**
 * Use entry title if available; otherwise, use reasonable default
 */
updateEntryTitle = (entryData) => {
  if (entryData.title && entryData.title.length > 0) {
    console.log('in updateEntryTitle, activeEntryElem: ');
    console.log( activeEntryElem);
    activeEntryElem.textContent = entryData.title;
  } else {
    activeEntryElem.textContent = entryData.activity.slice(0, 24) + " (" + entryData.points + " pts)";
  }
};


/**
 * Update points; If points > 0, also highlight the container
 */
updateModalPoints = (entryData) => {
  if (entryData.points > 0) {
    modalPointsField.text("Earned " + entryData.points + " points!");
    modalPointsField.show();
  } else {
    modalPointsField.hide();
  }
};


/**
 * Update element dataset
 */
updateElemDataset = (elem, data) => {
   if (elem.dataset === undefined) {
     elem.dataset = {};
   }
   for ( let [key, val] of Object.entries(data) ) {
     elem.dataset[key] = val;
   }
};


 /**
  * Select activity from dropdown and update dataset
  */
selectActivity = (activityElem) => {
  modalDurationValueField.prop('disabled', true);
  modalActivityField.html(activityElem.innerHTML);
  modalActivityField.val(activityElem.innerHTML);
  updateElemDataset(modalActivityField, activityElem.dataset);

  if (activityElem.dataset.durationUnit.includes('minute')) {
    // If it's a minutes-based activity, user should enter duration
    modalDurationValueField.prop('disabled', false);
  } else {
    // Otherwise, populate the default value and leave it disabled
    modalDurationValueField.val(activityElem.dataset.durationValue);
  }

  // Pluralize units if necessary
  if (activityElem.dataset.durationValue > 1) {
    modalDurationUnitField.html(activityElem.dataset.durationUnit + "s");
  } else {
    modalDurationUnitField.html(activityElem.dataset.durationUnit);
  }
};


/**
 * When page loads, do stuff and create event listeners
 */
$(document).ready(function() {
  setCSRFToken($('meta[name="csrf-token"]').attr('content'));

  userEmail = window.location.href.replace("#", "").split('/').slice(-1);

  $('#log-entry-modal').modal('hide');

  // Clear old modal alerts when modal is re-opened
  modal.on('show.bs.modal', function(event) {
    modalAlert.hide();
  })

  fillLogEntries();
  // Redraw calendar when prev/next buttons are clicked
  $(document.body).on('click touch', '.fc-prev-button, .fc-next-button', function (event) {
    fillLogEntries();
    // addListeners();
  });

  // Show log entry when date is clicked
  $(document.body).on('click touch', '.fc-day, .fc-day-top, .log-entry-btn', function (event) {
    event.stopPropagation();  // Need this to click on an entry button inside a clickable day cell
    if event.target.hasClass('.log-entry-btn') {
      activeEntryElem = event.target;
    }
    drawLogEntryModal(event.target);
  });

  // Save log entry when Save button is clicked
  $(document.body).on('click touch', '.save-entry', function() {
    saveLogEntry();
  });

  // Delete log entry when Delete button is clicked
  $(document.body).on('click touch', '.delete-entry', function() {
    const confirmed = confirm("Delete this entry forever?");
    if (confirmed === true) {
      deleteLogEntry();
    }
  })

  // Update selected value (and html) when a dropdown option is clicked
  $(document.body).on('click touch', '#activity-dropdown li > a', function() {
    selectActivity(this);
  });

});
