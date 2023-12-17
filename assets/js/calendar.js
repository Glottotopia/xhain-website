console.log("calendar!")


// now
const todays_day = new Date().getDate();

let do_js = true;
let cal_height;


function bind_events() {
    // close info overlay
    document.getElementById('cal_overlay').onclick = function(e) {
        child = document.getElementById('info_item');
        if (child && !child.contains(e.target)) {
            document.querySelector('body').classList.remove('show_details');
        }
    };
    // add year to month for mobile
    if (window.innerWidth < 1100) {
        let all_month_headers = document.querySelectorAll('.month_title');
        all_month_headers.forEach(function(el, i) {
            let year = el.getAttribute('data-year');
            el.innerHTML = el.innerHTML + ' <span> ' + year + '</span>';
            el.classList.add('stay_a_bit');
        });
    }
}

function scroll_to_today() {
    let top = 0;
    if (todays_day < 16 && window.innerWidth > 1100) {
        let viewportOffset = document.querySelector('.its_this_month').getBoundingClientRect();
        top = viewportOffset.top - 110;
    } else {
        let viewportOffset = document.querySelector('.today').getBoundingClientRect();
        top = viewportOffset.top - window.innerHeight * 0.3;
    }
    window.scrollBy(0, top);
}

function scroll_to_element(e) {
    let viewportOffset = e.getBoundingClientRect();
    let top = viewportOffset.top - window.innerHeight * 0.3;
    window.scrollBy({
        top: top,
        left: 0,
        behavior: 'instant',
    });
    // window.scroll(0, top + 1); // trigger scroll stuff
}

function handle_zoom(e, add_y = 0) {
    console.log('handle_zoom:');
    cal_height = document.getElementById('xhain_calendar').offsetHeight;
    let factor = window.scrollY / cal_height;
    console.log(window.scrollY + ' + ' + add_y + ' = ' + (window.scrollY + add_y));

    console.log(window.scrollY + add_y, cal_height, factor);

    if (!e.classList.contains('zoom_in')) {
        document.querySelector('body').classList.add('zoom_out');
        e.classList.add('zoom_in');
        let cal_height_zout = document.getElementById('xhain_calendar').offsetHeight;
        // document.getElementById('xhain_calendar').addEventListener('click', zoom_out_cal);
        bind_sub_element_clicks(true);
    } else {
        bind_sub_element_clicks(false);
        // document.getElementById('xhain_calendar').removeEventListener('click', zoom_out_cal);
        document.querySelector('body').classList.remove('zoom_out');
        e.classList.remove('zoom_in');
    }

    let cal_height_zout = document.getElementById('xhain_calendar').offsetHeight;
    let outcome = cal_height_zout * factor;
    console.log(cal_height_zout, outcome);
    window.scroll({
        top: outcome,
        left: 0,
        behavior: 'instant',
    });
    window.scroll(0, outcome + 1); // trigger scroll stuff
}

function bind_sub_element_clicks(bind) {
    const subbies = document.querySelectorAll('.cal_item, .month_title');
    if (bind) {
        subbies.forEach(function(subby) {
            subby.addEventListener('click', zoom_out_cal);
        });
    } else {
        subbies.forEach(function(subby) {
            subby.removeEventListener('click', zoom_out_cal);
        });
    }
}

function zoom_out_cal() {
    console.log(this);
    handle_zoom(document.getElementById('zoom_out'));
    scroll_to_element(this);
    // console.log('add zoom click y: ', event.clientY - window.innerHeight * 0.3);
}

// SCROLL
window.addEventListener('resize', cats);
window.addEventListener('scroll', scrolling);

function scrolling() {
    let cal_height = the_calendar.offsetHeight;
    let scroll = window.scrollY;
    console.log('scroll: ', scroll);

    let win_height = window.innerHeight;
    the_factor = scroll / (cal_height - win_height);
    let surplus = window.innerHeight * 0.14;

    let the_top = 35.8 - (2 - the_factor * 6);
    let the_bottom = 45.1 + (22 - the_factor * 42);
    back_wrap.style.gridTemplateRows = the_top + '% 15.1% ' + the_bottom + '%';
    back_wrap.style.top = -1 * (the_factor * surplus + height_plus) + 96 + 'px';
    one_tree.style.top = -1 * the_factor * (win_height / 2) + 96 + 'px';
    sec_tree.style.top = -1 * the_factor * (win_height / 2) + 96 + 'px';
    if (window.innerWidth < 1100) {
        let first_days = document.querySelectorAll('.cal_item.first_day');
        first_days.forEach(function(el, i) {
            let month = el.getAttribute('data-month');
            let month_name = document.querySelector('.month_title[data-month="' + month + '"]');
            let rect_bound = el.getBoundingClientRect();
            if (rect_bound.top < 140) {
                month_name.style.top = '80px';
                month_name.classList.add('on_stage');
            }
            if (rect_bound.top >= 140 && rect_bound.top < window.innerHeight + 80) {
                month_name.style.top = rect_bound.top - 60 + 'px';
                month_name.classList.remove('on_stage');
            }
            if (rect_bound.top >= window.innerHeight + 80) {
                month_name.style.top = window.innerHeight + 20 + 'px';
                month_name.classList.add('on_stage');
            }
        });
    }
}

function cats() {
    // center all this sh*t
    // 2400 / 1800;
    // 4 / 3;

    let win_height = window.innerHeight * 1.42;
    let win_width = window.innerWidth;
    let schnitt = win_width / 4 / (win_height / 3);
    let surplus = window.innerHeight * 0.12;
    if (schnitt > 1) {
        back_wrap.style.width = win_width + 'px';
        back_wrap.style.height = win_width * 0.75 + 'px';
        height_plus = win_width * 0.75 - win_height;
        // cut off top and bottom
    } else {
        back_wrap.style.width = win_height * 1.33 + 'px';
        back_wrap.style.height = win_height + 'px';
        height_plus = 0;
        back_wrap.style.left = '-' + (win_height * 1.33 - win_width) / 2 + 'px';
        //cut of left and right
    }
    back_wrap.style.top = -1 * (the_factor * surplus + height_plus) + 96 + 'px';
    if (window.innerWidth < 1100) {
        scrolling();
    }
}

function show_description(e) {
    if (!document.querySelector('body').classList.contains('zoom_out')) {
        let from_to_at = e.dataset.date + '<span> ' + e.dataset.weekday + '</span> ';
        from_to_at += e.querySelector('.start_time').textContent;
        if (e.querySelector('.end_time')) {
            if (
                e.querySelector('.end_time').textContent != '23:55' &&
                e.querySelector('.end_time').textContent != '11:55pm' &&
                e.querySelector('.end_time').textContent != '23:59' &&
                e.querySelector('.end_time').textContent != '11:59pm'
            ) {
                from_to_at += e.querySelector('.end_time').textContent;
            }
        }
        document.getElementById('info_date_time').innerHTML = from_to_at;
        document.getElementById('info_title').innerHTML = e.querySelector('.event_title').textContent;
        if (e.querySelector('.event_location')) {
            document.getElementById('info_location').innerHTML = e.querySelector('.event_location').textContent;
        }
        if (e.querySelector('.event_rule')) {
            document.getElementById('info_rule').innerHTML = '(' + e.querySelector('.event_rule').textContent + ')';
        }
        document.getElementById('info_description').innerHTML = '<br>' + e.querySelector('.event_description').innerHTML;
        document.querySelector('body').classList.add('show_details');
        document.getElementById('info_item').scroll(0, 0);
    }
}

/*
fin
*/