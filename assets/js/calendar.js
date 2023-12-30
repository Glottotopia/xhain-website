// Main entrypoint
document.addEventListener('DOMContentLoaded', function () {
  doubleColumnsAreUgly();
  highlightCurrentEvents();
  setupModal();
  startBlinking('.event.current', 1500);
  setTimeout(scrollToCurrentDay, 1000);
});

function getCurrentDateInfo() {
  var today = new Date();

  // Timezone handling
  var berlinOffset = 60;
  if (today.getMonth() > 2 && today.getMonth() < 9) {
    berlinOffset = 120;
  }
  today = new Date(today.getTime() + berlinOffset * 60000);

  return {
    dateString: today.toISOString().split('T')[0],
    currentTime: formatTime(today.getHours(), today.getMinutes()),
  };
}

function formatTime(hours, minutes) {
  return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
}

function scrollToCurrentDay() {
  var { dateString } = getCurrentDateInfo();
  var currentDayElement = document.getElementById(dateString);
  if (currentDayElement) {
    currentDayElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}

function highlightCurrentEvents() {
  var { dateString, currentTime } = getCurrentDateInfo();
  var currentDayElement = document.getElementById(dateString);

  if (currentDayElement) {
    currentDayElement.classList.add('current');
    var events = currentDayElement.querySelectorAll('.event');

    events.forEach(function (event) {
      var startTime = event.getAttribute('data-start-time');
      var endTime = event.getAttribute('data-end-time');

      if (currentTime >= startTime && currentTime <= endTime) {
        event.classList.add('current');
      }
    });
  }
}

function setupModal() {
  // Hide description and location
  const elementsToHide = document.querySelectorAll('.location, .description');
  elementsToHide.forEach((element) => {
    element.style.display = 'none';
  });

  // Setup for opening the modal
  document.querySelectorAll('.event').forEach(function (eventElement) {
    eventElement.addEventListener('click', function () {
      openModal(eventElement);
    });
  });

  // Setup for closing the modal with the close button
  var closeModalButton = document.querySelector('#event_modal .close');
  if (closeModalButton) {
    closeModalButton.onclick = function () {
      closeModal();
    };
  }

  // Setup for closing the modal by clicking outside of it
  window.onclick = function (event) {
    var modal = document.getElementById('event_modal');
    if (event.target == modal) {
      closeModal();
    }
  };

  // Setup for closing the modal with the ESC key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      var modal = document.getElementById('event_modal');
      if (modal.classList.contains('visible')) {
        modal.classList.remove('visible');
      }
    }
  });
}

function openModal(eventElement) {
  var modal = document.getElementById('event_modal');

  let theDate = eventElement.parentElement.id;
  let theWeekDay = eventElement.parentElement.getAttribute('data-wota');
  document.getElementById('info_date_time').innerHTML = theDate + ' ' + theWeekDay + ' <span>' + eventElement.querySelector('.time').innerText + '</span>';

  if (eventElement.querySelector('.location').innerText != '') {
    document.getElementById('info_location').style.display = 'block';
    document.getElementById('info_location').innerText = eventElement.querySelector('.location').innerText;
  } else {
    document.getElementById('info_location').style.display = 'none';
  }

  document.getElementById('info_title').innerText = eventElement.querySelector('.title').innerText;

  document.getElementById('info_description').innerHTML = eventElement.querySelector('.description').innerHTML;

  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var modal = document.getElementById('event_modal');
  modal.classList.remove('visible');
  document.body.style.overflow = 'visible';
}

function startBlinking(selector, interval) {
  const blinkingElements = document.querySelectorAll(selector);
  let isBlinking = true;

  function blink() {
    blinkingElements.forEach(function (element) {
      if (isBlinking) {
        element.style.opacity = '1';
      } else {
        element.style.opacity = '0.5';
      }
    });

    isBlinking = !isBlinking;
  }

  // Call the blink function at the specified interval (e.g., every 1.5 seconds)
  setInterval(blink, interval);
}

window.onclick = function (event) {
  var modal = document.getElementById('event_modal');
  if (event.target == modal) {
    closeModal();
  }
};

function doubleColumnsAreUgly() {
  // check for double columns
  let lastEventHour;
  const items = document.querySelectorAll('.event');
  for (let i = 0; i < items.length; i++) {
    if (items[i].getAttribute('data-hour') == lastEventHour) {
      lastEventHour++;
      items[i].setAttribute('data-hour', lastEventHour);
    } else {
      lastEventHour = items[i].getAttribute('data-hour');
    }
  }
}

// parallax scrolling
const back_wrap = document.getElementById('background_wrap');
const one_tree = document.getElementById('one_tree');
const sec_tree = document.getElementById('sec_tree');
let height_plus = 0;

window.addEventListener('scroll', scrolling);

function scrolling() {
  const the_factor = window.scrollY / (document.body.offsetHeight - window.innerHeight + 150);
  back_wrap.style.top = the_factor * window.innerHeight * -0.12 - height_plus + 96 + 'px';
  let the_top = 35.8 - (2 - the_factor * 6);
  let the_bottom = 45.1 + (22 - the_factor * 42);
  back_wrap.style.gridTemplateRows = the_top + '% 15.1% ' + the_bottom + '%';
  one_tree.style.top = -1 * the_factor * (window.innerHeight / 2) + 96 + 'px';
  sec_tree.style.top = -1 * the_factor * (window.innerHeight / 2) + 96 + 'px';
}

window.addEventListener('resize', positionBackWrap);
window.addEventListener('load', positionBackWrap);

function positionBackWrap() {
  let win_height = window.innerHeight * 1.3;
  let win_width = window.innerWidth;
  let ratio = win_width / 4 / (win_height / 3);
  if (ratio > 1) {
    // cut off top and bottom
    back_wrap.style.width = win_width + 'px';
    back_wrap.style.height = win_width * 0.75 + 'px';
    height_plus = win_width * 0.75 - win_height;
  } else {
    //cut of left and right
    back_wrap.style.width = win_height * 1.33 + 'px';
    back_wrap.style.height = win_height + 'px';
    height_plus = 0;
    back_wrap.style.left = '-' + (win_height * 1.33 - win_width) / 2 + 'px';
  }
  scrolling();
}
