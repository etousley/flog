$(document).ready(function() {

  // Fill in any timestamps that are supposed to use the local timezone
  $('.local-ts').each( (index, elem) => {
    let utcTs = moment(elem.dataset.utcTs);
    let localTs = utcTs.local().format('hh:mm a');
    elem.textContent = localTs;
  });

});
