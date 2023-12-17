/*

Parse ics to js object,
build calendar html

*/

// input
let input = {};

// now
let this_year, this_month, this_day, this_hour, this_minute;

// for counting
let the_year, the_month, the_day;
// limits of calendar
let last_year, last_month, last_day;
const the_calendar = document.getElementById('xhain_calendar');

// language package en
let month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let day_names_short = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let day_names = { 'MO': 'Monday', 'TU': 'Tuesday', 'WE': 'Wednesday', 'TH': 'Thursday', 'FR': 'Friday', 'SA': 'Saturday', 'SU': 'Sunday' };
let rhythm_names = ['every', 'of the month', 'second last', 'last', 'this', 'first', 'second', 'third', 'fourth', 'fifth'];

// parallax scrolling
const back_wrap = document.getElementById('background_wrap');
const one_tree = document.getElementById('one_tree');
const sec_tree = document.getElementById('sec_tree');
let height_plus, surplus;
let the_factor = 0;

// los geht's
function init_calendar() {
  if (the_language == 'de') {
    the_calendar.classList.add('in_german'); // translates "Today", per pseudo element
  }
  fetch('https://xcal.mrhide.de/assets/xhaincal.ics')
    // fetch('https://files.x-hain.de/remote.php/dav/public-calendars/Yi63cicwgDnjaBHR/?export')
    .then((res) => res.text())
    .then((text) => {
      setup_date_and_time();
      check_language();
      parse_to_json(text);
    })
    .catch((e) => console.error(e));
}

function parse_to_json(iCalendarData) {
  const parsed = ICAL.parse(iCalendarData);
  const event_arr = parsed[2];
  // console.log(event_arr);

  for (let ia = 0; ia < event_arr.length; ia++) {
    const one_event = event_arr[ia];
    if (one_event[0] != 'vtimezone') {
      let e_year,
        e_month,
        e_day,
        e_hour,
        e_min,
        e_end_hour,
        e_end_min,
        e_title,
        e_description,
        e_location,
        e_recurring,
        e_rec_count,
        output_the_rule,
        e_until_y,
        e_until_m,
        e_until_d;

      for (let ib = 0; ib < one_event[1].length; ib++) {
        const event_details = one_event[1][ib];

        if (event_details[0] == 'summary') {
          e_title = event_details[3];
          // ###############################
          // if (e_title == 'Spieleabend - Game Night') {
          //   console.log(one_event);
          // }
          // ###############################
        }

        if (event_details[0] == 'location' && event_details[2] == 'text') {
          e_location = event_details[3];
        }

        if (event_details[0] == 'dtstart') {
          e_year = cut_date_to(event_details[3], 'y');
          e_month = cut_date_to(event_details[3], 'm');
          e_day = cut_date_to(event_details[3], 'd');
          e_hour = cut_date_to(event_details[3], 'h');
          e_min = cut_date_to(event_details[3], 'min');
        }

        if (event_details[0] == 'dtend') {
          e_end_hour = cut_date_to(event_details[3], 'h');
          e_end_min = cut_date_to(event_details[3], 'min');
        }

        if (event_details[0] == 'description') {
          e_description = event_details[3];
        }

        if (event_details[0] == 'rrule' && typeof event_details[3] === 'object') {
          if (event_details[3].until) {
            e_until_y = cut_date_to(event_details[3].until, 'y');
            e_until_m = cut_date_to(event_details[3].until, 'm');
            e_until_d = cut_date_to(event_details[3].until, 'd');
            // no need?
            // let e_until_s = cut_date_to(event_details[3].until, 's');
            // if (e_until_s == 59) {
            //   if (e_until_d > 2) {
            //     e_until_d--;
            //   } else {
            //     e_until_m--;
            //     e_until_d = daysInMonth(e_until_y, e_until_m);
            //   }
            // }
          }

          // ###############################
          // if (e_title == 'Spieleabend - Game Night') {
          //   console.log('rrule', event_details[3]);
          // }
          // ###############################
          e_recurring = event_details[3];
          e_rec_count = event_details[3].count;
          // a nice thing for info box:
          output_the_rule = get_rule_in_words(e_recurring.freq, e_recurring.interval, e_recurring.byday, e_recurring.bysetpos, e_title);
        }
      }

      // ### RECURRING EVENTS
      if (typeof e_recurring === 'object') {
        //  && e_title == 'Spieleabend - Game Night'
        let count_in_freq = [e_year, e_month, e_day];

        let safety_first = 0;
        let count_the_count = 9999999;
        if (e_rec_count) {
          count_the_count = e_rec_count;
        }

        // write event
        write_to_input(
          count_in_freq[0],
          count_in_freq[1],
          count_in_freq[2],
          e_title,
          e_location,
          e_hour,
          e_min,
          e_end_hour,
          e_end_min,
          e_description,
          e_recurring,
          output_the_rule
        );

        while (safety_first < 100 && count_in_freq && count_in_freq != false && count_the_count > 0) {
          count_in_freq = next_recurrence(count_in_freq, e_recurring.freq, e_recurring.interval, e_recurring.byday, e_recurring.bysetpos, e_until_y, e_until_m, e_until_d, e_title);
          safety_first++;
          count_the_count--;
          if (count_in_freq && count_in_freq != false) {
            // ###############################
            // if (e_title == 'Spieleabend - Game Night') {
            //   console.log('writing: ', e_title);
            //   console.log(count_in_freq);
            // console.log(count_in_freq[0] + '-' + count_in_freq[1] + '-' + count_in_freq[2] + ' ' + e_hour + ':' + e_min);
            // }
            // ###############################
            // write recurrent event
            write_to_input(
              count_in_freq[0],
              count_in_freq[1],
              count_in_freq[2],
              e_title,
              e_location,
              e_hour,
              e_min,
              e_end_hour,
              e_end_min,
              e_description,
              e_recurring,
              output_the_rule
            );
          }
        }
      } else {
        // ### SINGLE EVENTS
        write_to_input(e_year, e_month, e_day, e_title, e_location, e_hour, e_min, e_end_hour, e_end_min, e_description, e_recurring, output_the_rule);
      }
    }
  }
  console.log(input);
  build_the_calendar();
}

function get_rule_in_words(freq, interval, byday, bysetpos, e_title) {
  // ###############################
  // if (e_title == 'Spieleabend - Game Night') {
  //   console.log('byday: ', byday);
  //   console.log('bysetpos: ', bysetpos);
  // }
  // ###############################

  if (byday && byday.length > 2) {
    bysetpos = seperating_byday(byday, 1);
    byday = seperating_byday(byday, 0);
  }
  // console.log(byday);
  // console.log(freq);
  if (freq == 'WEEKLY') {
    if (interval) {
      return rhythm_names[0] + ' ' + rhythm_names[interval + 4] + ' ' + day_names[byday];
    } else {
      return rhythm_names[0] + ' ' + day_names[byday];
    }
  }
  if (freq == 'MONTHLY') {
    // ###############################
    // if (e_title == 'Spieleabend - Game Night') {
    // console.log('2nd byday: ', byday);
    // console.log('2nd bysetpos: ', bysetpos);
    // console.log('name: ', rhythm_names[parseInt(bysetpos) + 4]);
    // console.log('return: ', rhythm_names[0] + ' ' + rhythm_names[parseInt(bysetpos) + 4] + ' ' + day_names[byday] + ' ' + rhythm_names[1]);
    // }
    // ###############################

    return rhythm_names[0] + ' ' + rhythm_names[parseInt(bysetpos) + 4] + ' ' + day_names[byday] + ' ' + rhythm_names[1];
  }
  if (freq == 'YEARLY') {
  }
}

function next_recurrence(date, freq, interval = 1, byday, bysetpos = 1, until_y, until_m, until_d, e_title) {
  let year = parseInt(date[0]);
  let month = parseInt(date[1]);
  let day = parseInt(date[2]);
  let output = [until_y, until_m, until_d];

  // sometimes byday includes setpos
  if (byday && byday.length > 2) {
    bysetpos = seperating_byday(byday, 1);
    byday = seperating_byday(byday, 0);
  }

  // ### I GOT RHYTHM
  if (freq == 'WEEKLY') {
    day += 7 * interval;
    if (day > daysInMonth(year, month)) {
      day -= daysInMonth(year, month);
      if (month < 12) {
        month++;
      } else {
        month = 1;
        year++;
      }
    }
    output = [year, month, day];
  }
  if (freq == 'MONTHLY') {
    month += interval;
    if (month > 12) {
      month -= 12;
      year++;
    }
    if (bysetpos && byday) {
      output = get_weekday_of_month(year, month, day, byday, bysetpos, e_title);
    } else {
      output = [year, month, day];
    }
  }
  if (freq == 'YEARLY') {
    year += interval;
    output = [year, month, day];
  }

  // ### CHECK FOR OVERSTEPPED LIMITS AND OUTPUT

  // ###############################
  // if (e_title == 'Spieleabend - Game Night' && until_y && until_m && until_d) {
  //   console.log(get_date_as_int(until_y, until_m, until_d), ' <= ', get_date_as_int(output[0], output[1], output[2]));
  // }
  // ###############################

  if (until_y && until_m && until_d && get_date_as_int(until_y, until_m, until_d) <= get_date_as_int(output[0], output[1], output[2])) {
    // limit by .until
    return false;
  } else if (get_date_as_int(output[0], output[1], output[2]) > get_cal_limit()) {
    // limit by future (more than 3 month)
    return false;
  } else {
    // all good
    return output;
  }
}

function seperating_byday(byday, is_pos) {
  if (byday && byday.length == 3) {
    if (is_pos == 1) {
      return byday.slice(0, 1);
    } else {
      return byday.slice(-2);
    }
  }
  if (byday && byday.length == 4) {
    // must be a negative position
    if (byday.slice(0, 1) == '-') {
      if (is_pos == 1) {
        return byday.slice(0, 2);
      } else {
        return byday.slice(-2);
      }
    }
  }
  return byday;
}

function get_weekday_of_month(year, month, day, byday, bysetpos, e_title) {
  let byday_nr = get_weekday_int(byday);
  if (bysetpos > 0) {
    day = 1;
    let weekday = dayOfWeek(year, month, day);
    let safegard = 0;
    while (safegard < 100 && weekday != byday_nr) {
      day++;
      weekday++;
      if (weekday > 6) {
        weekday = 0;
      }
      safegard++;
    }
    day += (bysetpos - 1) * 7;
  } else {
    bysetpos *= -1;
    // count backwards
    day = daysInMonth(year, month);

    let last_weekday = dayOfWeek(year, month, day);
    // ###############################
    // if (e_title == 'Spieleabend - Game Night') {
    //   console.log('month: ', month);
    //   console.log('day: ', day);
    //   console.log('last_weekday: ', last_weekday);
    // }
    // ###############################

    let safegard = 0;
    while (safegard < 100 && last_weekday != byday_nr) {
      day--;
      last_weekday--;
      if (last_weekday < 0) {
        last_weekday = 6;
      }
      safegard++;
    }
    day -= (bysetpos - 1) * 7;
    // ###############################
    // if (e_title == 'Spieleabend - Game Night') {
    //   console.log('after day: ', day);
    //   console.log('after last_weekday: ', last_weekday);
    //   console.log('byday_nr: ', byday_nr);
    // }
    // ###############################
  }
  return [year, month, day];
}

function get_weekday_int(byday) {
  if (byday == 'MO') {
    return 1;
  }
  if (byday == 'TU') {
    return 2;
  }
  if (byday == 'WE') {
    return 3;
  }
  if (byday == 'TH') {
    return 4;
  }
  if (byday == 'FR') {
    return 5;
  }
  if (byday == 'SA') {
    return 6;
  }
  if (byday == 'SU') {
    return 0;
  }
  return false;
}

function get_date_as_int(y, m, d) {
  return parseInt(y * 10000 + m * 100 + d);
}

function get_cal_limit() {
  return get_date_as_int(last_year, last_month, last_day);
}

function write_to_input(i_year, i_month, i_day, i_title, i_location, i_hour, i_min, i_end_hour, i_end_min, i_description, i_recurring, the_rule) {
  if (!input.hasOwnProperty(i_year)) {
    input[i_year] = { 'set': 1 };
  }
  if (!input[i_year].hasOwnProperty(i_month)) {
    input[i_year][i_month] = { 'set': 1 };
  }
  if (!input[i_year][i_month].hasOwnProperty(i_day)) {
    input[i_year][i_month][i_day] = [];
  }

  // check for shortcode recurrence rule
  if (typeof i_recurring !== 'object' && i_description && i_description.indexOf('[rrule ') > 0) {
    let rule_object_v = i_description.split('[rrule ').pop().split(']')[0];
    let rule_freq = 'MONTHLY';
    if (rule_object_v.length <= 2) {
      rule_freq = 'WEEKLY';
    }
    i_recurring = { 'byday': rule_object_v, 'freq': rule_freq };
    the_rule = get_rule_in_words(rule_freq, null, rule_object_v, null, null);
    const i_start = i_description.indexOf('[rrule ');
    const i_end = i_description.slice(i_start).indexOf(']') + i_start + 1;
    i_description = i_description.slice(0, i_start) + i_description.slice(i_end);
  }

  let this_event = {
    'title': i_title,
    'time_h': i_hour,
    'time_m': i_min,
    'time_end_h': i_end_hour,
    'time_end_m': i_end_min,
    'location': i_location,
    'description': i_description,
    'recurring': i_recurring,
    'the_rule': the_rule,
  };

  // ###############################
  // if (i_title == 'Spieleabend - Game Night') {
  //   console.log('this_event: ', this_event);
  // }
  // ###############################

  // check for duplicates
  let events_of_that_day = input[i_year][i_month][i_day];
  let better_not_to_use = false;
  let duplicate = -1;
  for (let e = 0; e < events_of_that_day.length; e++) {
    const an_event = events_of_that_day[e];
    if (an_event && an_event.title == this_event.title) {
      // console.log(an_event.title + ' == ' + this_event.title + '(' + e + ')');
      // console.log(an_event.description + ' :: ' + this_event.description);
      // console.log(i_year + '-' + i_month + '-' + i_day);
      // console.log(an_event.time_h + ' :: ' + this_event.time_h);

      duplicate = e;
      // check for description
      if (typeof this_event.description === undefined) {
        better_not_to_use = true;
      }
    }
  }
  if (better_not_to_use == false) {
    if (duplicate >= 0) {
      // console.log('overwrite at ' + duplicate);
      input[i_year][i_month][i_day][duplicate] = this_event;
    } else {
      // console.log('push');
      input[i_year][i_month][i_day].push(this_event);
    }
  }
}

function cut_date_to(stamp, part) {
  if (part == 'y') {
    return parseInt(stamp.slice(0, 4));
  }
  if (part == 'm') {
    return parseInt(stamp.slice(5, 7));
  }
  if (part == 'd') {
    return parseInt(stamp.slice(8, 10));
  }

  if (stamp.length < 11) {
    return 0;
  } else {
    if (part == 'h') {
      return parseInt(stamp.slice(11, 13));
    }
    if (part == 'min') {
      return parseInt(stamp.slice(14, 16));
    }
    if (part == 's') {
      return parseInt(stamp.slice(17, 19));
    }
  }
  return false;
}

function build_the_calendar() {
  let html = '';

  while (get_cal_limit() >= get_date_as_int(the_year, the_month, the_day)) {
    // add month name and year
    let grid_col_style = 'grid-column:3/-1;justify-self:flex-end;';
    let month_title_class = '';
    if (the_day == 1) {
      if (the_month == 1) {
        if (wota == 1 || wota > 3) {
          html += '<div class="year_title">' + the_year + '</div>';
        } else {
          html += '<div class="year_title" style="grid-column:1/4;justify-self:flex-start;">' + the_year + '</div>';
        }
      }
      if (wota == 1 || wota > 3) {
        grid_col_style = 'grid-column:1/4;justify-self:flex-start;';
      } else {
      }
      if (the_month == this_month) {
        month_title_class = ' its_this_month';
      }
      html +=
        '<div class="month_title' +
        month_title_class +
        '" style="' +
        grid_col_style +
        '" data-month="' +
        the_month +
        '" data-year="' +
        the_year +
        '">' +
        month_names[the_month - 1] +
        '</div>';
    }

    // ### ADD CALENDAR ITEM

    let day_class = '';
    // today?
    if (this_day == the_day && this_month == the_month) {
      day_class += ' today';
    }
    if (wota == 1) {
      day_class += ' montag';
      // add mobile breaker
      html += '<div class="flex_breaker"></div>';
    }
    if (wota == 7) {
      day_class += ' sonntag';
    }
    if (the_day == 1) {
      day_class += ' first_day';
    }
    if (the_day == daysInMonth(the_year, the_month)) {
      day_class += ' last_day';
    }

    // check for events on that date
    if (input.hasOwnProperty(the_year) && input[the_year].hasOwnProperty(the_month) && input[the_year][the_month].hasOwnProperty(the_day)) {
      html += '<div class="cal_item' + day_class + '" style="grid-column:' + wota + '" data-month="' + the_month + '">';
      if (the_day < 10) {
        html += '<span class="monthday">0' + the_day + '</span>';
      } else {
        html += '<span class="monthday">' + the_day + '</span>';
      }
      html += '<span class="weekday">' + day_names_short[wota - 1] + '</span>';

      input[the_year][the_month][the_day].forEach(function (entry) {
        // ###
        // ### ADD EVENT TO DAY

        let entry_class = '';
        // now?
        if (this_day == the_day && this_month == the_month && entry.hasOwnProperty('time_h') && entry.hasOwnProperty('time_m')) {
          // if (entry.hasOwnProperty('title') && entry['title'] == 'MakeHERSpace') {
          //   console.log('MakeHERSpace: ', entry['time_h'], entry['time_m'], entry['time_end_h'], entry['time_end_m']);
          // }
          if (entry['time_h'] < this_hour || (entry['time_h'] == this_hour && entry['time_m'] < this_minute)) {
            if (entry.hasOwnProperty('time_end_h') && entry.hasOwnProperty('time_end_m')) {
              let test_hour = entry['time_end_h'];
              if (test_hour == 0) {
                test_hour = 24;
              }
              if (test_hour > this_hour || (entry['time_end_h'] == this_hour && entry['time_end_m'] > this_minute)) {
                entry_class += ' now';
              }
            } else {
              entry_class += ' now';
            }
          }
        }
        // grid row position along start time
        let hours_in_grid_row = '';
        let our_row = 0;
        if (entry.hasOwnProperty('time_h') && entry['time_h']) {
          our_row = Math.floor(entry['time_h'] / 6) + 1;
          hours_in_grid_row = ';grid-row-start:' + our_row;
        }
        if (entry.hasOwnProperty('time_end_h') && entry.hasOwnProperty('time_end_m')) {
          let endhour = entry['time_end_h'];
          if (entry['time_end_m'] >= 55) {
            endhour = (endhour + 1) % 24;
          }
          if ((endhour + 24 - entry['time_h']) % 24 >= 6) {
            entry_class += ' long_event';
            if (our_row != 0 && our_row < 3) {
              hours_in_grid_row += ';grid-row-end:' + (our_row + 2);
            }
          }
          if ((entry['time_end_h'] == 23 && entry['time_end_m'] >= 55) || entry['time_end_h'] == 0) {
            entry_class += ' till_midnight';
          }
        }
        // add at last!
        if (entry.hasOwnProperty('description') && entry['description']) {
          entry_class += ' with_info" onclick="show_description(this)';
        }

        html += '<div class="cal_entry' + entry_class + '" data-style="order:' + entry['time_h'] + hours_in_grid_row + '" data-date="';
        html += formated_date(the_year, the_month, the_day);
        html += '" data-weekday="' + day_names_short[wota - 1] + '">';

        html += '<div class="the_times">';
        if (entry.hasOwnProperty('time_h') && entry.hasOwnProperty('time_m')) {
          html += '<span class="start_time">' + formated_time(entry['time_h'], entry['time_m']) + '</span>';
        }
        if (entry.hasOwnProperty('time_end_h') && entry.hasOwnProperty('time_end_m')) {
          if ((entry['time_end_h'] == 23 && entry['time_end_m'] < 55) || (entry['time_end_h'] != 0 && entry['time_end_m'] < 55)) {
            html += '<span class="end_time"> - ' + formated_time(entry['time_end_h'], entry['time_end_m']) + '</span>';
          }
        }
        html += '</div>';

        if (entry.hasOwnProperty('title') && entry['title']) {
          html += '<span class="event_title">' + entry['title'] + '</span>';
        }

        if (entry.hasOwnProperty('the_rule') && entry['the_rule']) {
          html += '<span class="event_rule">' + entry['the_rule'] + '</span>';
        }

        if (entry.hasOwnProperty('location') && entry['location']) {
          html += '<span class="event_location">' + entry['location'] + '</span>';
        }

        if (entry.hasOwnProperty('description') && entry['description']) {
          let beschreibung = entry['description'].replace(new RegExp('\r?\n', 'g'), '<br />');

          html += '<div class="event_description">' + all_urls_to_links(beschreibung) + '</div><div class="info_points"><div>...</div></div>';
        }
        html += '</div>';
      });
      html += '</div>';
    } else {
      // no event for this day
      html += '<div class="cal_item' + day_class + ' tote_hose" style="grid-column:' + wota + '" data-month="' + the_month + '">';
      if (the_day < 10) {
        html += '<span class="monthday">0' + the_day + '</span>';
      } else {
        html += '<span class="monthday">' + the_day + '</span>';
      }
      html += '<span class="weekday">' + day_names_short[wota - 1] + '</span>';
      html += '</div>';
    }

    next_day();
  }
  the_calendar.innerHTML = html;
  if (do_js) {
    bind_events();
    cats();
    scroll_to_today();
  }
}

// ###### HELPERS #####

function all_urls_to_links(description) {
  let url_regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return description.replace(url_regex, '<a href="$1" target="_blank" title="open in a new tab/window">$1</a>');
}

function next_day() {
  // date
  if (the_day < daysInMonth(the_year, the_month)) {
    the_day++;
  } else {
    the_day = 1;
    if (the_month < 12) {
      the_month++;
    } else {
      the_month = 1;
      the_year++;
    }
  }
  // weekday / Wochentag
  if (wota < 7) {
    wota++;
  } else {
    wota = 1;
  }
}

function setup_date_and_time() {
  const date = new Date();
  // for now:
  this_year = date.getFullYear();
  this_month = date.getMonth() + 1;
  this_day = date.getDate();
  // for cycling through the dates:
  the_day = 1;
  the_month = this_month - 1; // start with last month
  if (the_month < 1) the_month = 12;
  the_year = this_year;
  wota = dayOfWeek(the_year, the_month, the_day);
  this_hour = date.getHours();
  this_minute = date.getMinutes();
  console.log(this_day + '.' + this_month + '.' + this_year + ' ' + this_hour + ':' + this_minute);
  // end of the calendar:
  last_year = this_year;
  last_month = this_month + 2;
  if (last_month > 12) {
    last_month -= 12;
    last_year++;
  }
  last_day = daysInMonth(last_year, last_month);
}

function daysInMonth(year, month) {
  // how many days has this month
  return new Date(year, month, 0).getDate();
}

function dayOfWeek(year, month, day) {
  // Wochentag
  return new Date(year, month - 1, day).getDay();
}

function check_language() {
  // should be triggered before building the calendar
  if (the_language == 'de') {
    month_names = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    day_names_short = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    day_names = { 'MO': 'Montag', 'TU': 'Dienstag', 'WE': 'Mittwoch', 'TH': 'Donnerstag', 'FR': 'Freitag', 'SA': 'Samstag', 'SU': 'Sonntag' };
    rhythm_names = ['jeden', 'des Monats', 'vorletzte', 'letzte', 'diesen', 'erste', 'zweite', 'dritte', 'vierte', 'fünfte'];
  }
}

function formated_time(hours, minutes) {
  // per language
  if (the_language == 'de') {
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (hours == 24) {
      hours = 0;
    }
    return hours + ':' + minutes;
  } else {
    if (minutes < 10 && minutes > 0) {
      minutes = '0' + minutes;
    }
    let funzel = 'am';
    if (hours > 12) {
      funzel = 'pm';
    }
    hours = hours % 12;
    if (hours == 0) {
      hours = 12;
    }
    if (minutes != 0) {
      return hours + ':' + minutes + funzel;
    } else {
      return hours + funzel;
    }
  }
}

function formated_date(year, month, day) {
  // per language
  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }
  if (the_language == 'de') {
    return day + '.' + month + '.' + year;
  } else {
    return year + '-' + month + '-' + day;
  }
}

/*
fin
*/
