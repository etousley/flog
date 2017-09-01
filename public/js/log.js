const CSRF_HEADER = 'X-CSRF-Token';

let modal = $('#log-entry-modal');
let entryDateField = $('#entry-date-field');
let entryTitleField = $('#entry-title-field');
let entryActivityField = $('#entry-activity-field');
let entryDescriptionField = $('#entry-description-field');
let entryDurationValueField = $('#entry-duration-value-field');
let entryDurationUnitField = $('#entry-duration-unit-field');
let entryContestField = $('#entry-contest-field');
let entryErrorField = $('#entry-error-field');
let entryInfoField = $('#entry-info-field');
let entryPointsField = $('#entry-points-field');
let entrySaveButton = $('#entry-save-btn');
let entryDeleteButton = $('#entry-delete-btn');
let activeEntryElem = undefined;
let ownerEmail = $('#owner-email').text();
let userEmail = $('#user-email').text();


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
    fixedWeekCount: false  // Defaults to true, which forces all months to 6 weeks
  });

  $('.fc-scroller').removeAttr('style');  // Defaults to fixed height, no scroll??

  const dayElems = $('.fc-day')
  const startDate = dayElems[0].dataset.date;
  const endDate = dayElems[dayElems.length - 1].dataset.date;
  const getLogEntriesUrl = '/api/log-entry?' + jQuery.param({
    "user": ownerEmail,
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
 * Render and display modal to reflect data (date, userEmail, existing activities)
 */
drawLogEntryModal = (clickedDayElem) => {
  const activityName = activeEntryElem.dataset.activity;
  let targetActivity = undefined;
  let logOwner = activeEntryElem.dataset.userEmail;

  // If non-ownerEmail clicks an empty date, nothing should happen
  // if (ownerEmail !== logOwner && !activityName) {
  //   return;
  // }

  entryDateField.html( activeEntryElem.dataset.date.slice(0, 10) );
  entryTitleField.val(activeEntryElem.dataset.title);
  entryDescriptionField.val(activeEntryElem.dataset.description);
  entryDurationValueField.val(activeEntryElem.dataset.durationValue);
  entryContestField.val(activeEntryElem.dataset.contest);
  // console.log(activeEntryElem.dataset);

  updateModalPoints(activeEntryElem.dataset);

  if (activeEntryElem.dataset.activity) {
    // Activity has already been saved
    entryActivityField.val(activeEntryElem.dataset.activity);
    entryActivityField.text(activeEntryElem.dataset.activity);
    entryDurationUnitField.text(activeEntryElem.dataset.durationUnit);
  } else if (logOwner && ownerEmail === logOwner) {
    // Log ownerEmail is saving activity for the first time
    targetActivity = $(".dropdown-item:contains('" + activityName + "')")[0];
    entryDurationUnitField.val(targetActivity.dataset.durationUnit) + 's';
    updateElemDataset(entryActivityField, targetActivity.dataset);
    entryActivityField.val(targetActivity);
    entryActivityField.text(activityName);
  } else {
    // Activity hasn't been chosen yet
    entryActivityField.val(undefined);
    entryActivityField.text("Choose an activity...");
  }

  if (activeEntryElem && activeEntryElem.dataset._id !== undefined) {
    entryDeleteButton.prop("disabled", false);
  }
  if (activeEntryElem && activeEntryElem.dataset.activity !== undefined) {
    entrySaveButton.prop("disabled", false);
  }

  modal.modal('show');
};


/**
 * Create or update log entry
 */
 saveLogEntry = () => {
   let entryData = {
     "date": entryDateField.text(),
     "title": entryTitleField.val(),
     "user": ownerEmail,
     "activity": entryActivityField.html(),
     "description": entryDescriptionField.val(),
     "durationValue": entryDurationValueField.val(),
     "durationUnit": entryDurationUnitField.text(),
    //  "category": entryActivityField.dataset.category
   }

   if (activeEntryElem.dataset._id !== undefined) {
     // If there's already an _id, do a PUT (update)
     $.ajax({
       url: '/api/log-entry/' + activeEntryElem.dataset._id,
       type: 'PUT',
       data: {"data": entryData},
       success: function(data) {
         let updatedEntry = data.data;
        //  console.log(updatedEntry);
         updateElemDataset(activeEntryElem, updatedEntry);
         updateEntryTitle(activeEntryElem.dataset);
         updateModalPoints(updatedEntry);
         entryContestField.val(updatedEntry.contest);

         entryInfoField.text('Updated entry');
         entryInfoField.show();
        //  console.log('Updated entry: ' + JSON.stringify(updatedEntry));
       },
       error: function(error) {
         entryErrorField.text(error.status + " error: " + error.statusText);
         entryErrorField.show();
       }
     });
   } else {
     // If there's no _id, do a POST (create)
     $.ajax({
       url: '/api/log-entry/',
       type: 'POST',
       data: {"data": entryData},
       success: function(data) {
         let createdEntry = data.data;
         addEntryElem(createdEntry);  // Will create new activeEntryElem
         entryDeleteButton.prop("disabled", false);
         entryInfoField.text('Added new entry');
         entryInfoField.show();
         entryContestField.val(createdEntry.contest);
        //  console.log('Created entry: ' + JSON.stringify(createdEntry));
       },
       error: function(error) {
         entryErrorField.text(error.status + " error: " + error.statusText);
         entryErrorField.show();
       }
     });
   }
 };


 /**
  * Delete log entry
  */
 deleteLogEntry = () => {
   $.ajax({
     url: '/api/log-entry/' + activeEntryElem.dataset._id,
     type: 'DELETE',
     success: function(data) {
       activeEntryElem.remove();
       entrySaveButton.prop("disabled", true);
       entryDeleteButton.prop("disabled", true);
       entryInfoField.text('Deleted entry');
       entryInfoField.show();
       entryPointsField.hide();
      //  console.log('Deleted entry');
     },
     error: function(error) {
       entryErrorField.text(error.status + " error: " + error.statusText);
       entryErrorField.show();
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
  dayElem.appendChild(activeEntryElem);

  updateElemDataset(activeEntryElem, entryData);
  updateEntryTitle(entryData);
  updateModalPoints(entryData);
  updateRowHeight(entryDate);

  entryContestField.val(entryData.contest);
};


/**
 * Make sure height of week row accommodates all entries in a given day
 */
updateRowHeight = (entryDate) => {
  const dayElem = document.querySelectorAll(`.fc-day[data-date='${entryDate}']`)[0];
  const thisRow = dayElem.parentElement.parentElement.parentElement.parentElement.parentElement;  // urgh
  const thisRowHeightPx = parseInt(thisRow.style.height.replace('px', ''));
  const dayEntries = dayElem.querySelectorAll('.log-entry-btn');
  const minRowHeightPx = 137;
  let totalHeight = 0;

  for (let elem of dayEntries) {
    totalHeight += elem.clientHeight;
  }

  if (thisRowHeightPx < (totalHeight + 100)) {
    thisRow.style.height = Math.max( minRowHeightPx, (totalHeight + 100) ) + 'px';
  } // else { shrink row -- probably unecessary }
}


/**
 * Use entry title if available; otherwise, use reasonable default
 */
updateEntryTitle = (entryData) => {
  if (entryData.title && entryData.title.length > 0) {
    activeEntryElem.textContent = entryData.title;
  } else {
    activeEntryElem.textContent = entryData.activity + " (" + entryData.points + " pts)";
  }
};


/**
 * Update points; If points > 0, also highlight the container
 */
updateModalPoints = (entryData) => {
  const points = parseInt(entryData.points);
  if (points === 0) {
    entryPointsField.text("Everything's made up and the points don't matter!");
    entryPointsField.show();
  } else if (points > 0) {
    entryPointsField.text("Earned " + points + " points!");
    entryPointsField.show();
  } else {
    entryPointsField.hide();
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
  entryDurationValueField.prop('disabled', true);
  entryActivityField.html(activityElem.innerHTML);
  entryActivityField.val(activityElem.innerHTML);
  updateElemDataset(entryActivityField, activityElem.dataset);

  if (activityElem.dataset.durationUnit.includes('minute')) {
    // If it's a minutes-based activity, userEmail should enter duration
    entryDurationValueField.prop('disabled', false);
  } else {
    // Otherwise, populate the default value and leave it disabled
    entryDurationValueField.val(activityElem.dataset.durationValue);
  }

  // Pluralize units if necessary
  if (activityElem.dataset.durationValue > 1) {
    entryDurationUnitField.html(activityElem.dataset.durationUnit + "s");
  } else {
    entryDurationUnitField.html(activityElem.dataset.durationUnit);
  }

  entrySaveButton.attr('disabled', false);
};


/**
 * Validate entry; return list of errors
 */
 getEntryErrors = (entryData) => {
  const requiredFields = ['date', 'activity', 'durationValue', 'durationUnit'];
  const numFields = ['durationValue'];
  let errors = [];

  for (let field of requiredFields) {
    let val = entryData[field];
    if (val === undefined) {
      errors.push("Required field `${field}` is undefined");
    }
  }

  try {
    let d = new Date(entryData.date);
  } catch(err) {
    errors.push("Invalid date: `${field}`");
  }

}


/**
 * When page loads, do stuff and create event listeners
 */
$(document).ready(function() {
  setCSRFToken($('meta[name="csrf-token"]').attr('content'));

  // console.log('ownerEmail: ' + ownerEmail);
  // console.log('userEmail: ' + userEmail);

  modal.modal('hide');

  // Clear old modal alerts when modal is re-opened
  modal.on('show.bs.modal', function(event) {
    entryInfoField.hide();
    entryErrorField.hide();
  });

  fillLogEntries();
  // Redraw calendar when prev/next buttons are clicked
  $(document.body).on('click touch', '.fc-prev-button, .fc-next-button', function (event) {
    fillLogEntries();
  });

  // Trigger hover state for day when userEmail hovers over day-top
  $(document.body).on('mouseover', '.fc-day, .fc-day-top', function (event) {
    if (event.target.classList.contains('fc-day') || event.target.classList.contains('fc-day-top')) {
      const entryDate = event.target.dataset.date;
      const dayElem = document.querySelectorAll(`.fc-day[data-date='${entryDate}']`)[0];

      // If userEmail is also log ownerEmail, indicate that day elems are clickable
      // Can fudge this in the console :P
      if (userEmail === ownerEmail) {
        $('.fc-day.active').removeClass('active');
        dayElem.className += ' active';
      }
    }
  });

  // Mouseout doesn't look great because of html inside cell (see: .fc-content-skeleton)
  // $(document.body).on('mouseout', '.fc-day, .fc-day-top', function (event) {
  //     $('.fc-day.active').removeClass('active');
  // });

  // Show log entry when date is clicked
  $(document.body).on('click touch', '.fc-day, .fc-day-top, .log-entry-btn', function (event) {
    event.stopPropagation();  // Need this to click on an entry button inside a clickable day cell
    if (userEmail === ownerEmail || event.target.classList.contains('log-entry-btn')) {
      activeEntryElem = event.target;
      drawLogEntryModal(event.target);
    }
  });

  // Save log entry when Save button is clicked
  $(document.body).on('click touch', '#entry-save-btn', function() {
    saveLogEntry();
  });

  // Delete log entry when Delete button is clicked
  $(document.body).on('click touch', '#entry-delete-btn', function() {
    const confirmed = confirm("Delete this entry forever?");
    if (confirmed === true) {
      deleteLogEntry();
    }
  });

  // Update selected value (and html) when a dropdown option is clicked
  $(document.body).on('click touch', '#entry-activity-dropdown li > a', function() {
    selectActivity(this);
  });

});
