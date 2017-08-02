
$(document).ready(function() {

  /*
   * Page is ready; draw calendar
   */
  $('#calendar').fullCalendar({
    // put your options and callbacks here
  });


  /*
   * When calendar day is clicked
   */
  $('.fc-day').on('click touch', function () {
    // Mark active
    $('.fc-day').removeClass('active');
    $(this).addClass('active');

    $('#calendar-modal').modal();
  });
});
