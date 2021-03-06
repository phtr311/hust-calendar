/**=================================================================
 * Khởi tạo dữ liệu, lấy data ngày tháng năm
 * @param {*} model : ????
 * @param {cài đặt} options : Các giá trị cài đặt cho dữ liệu
 * @param {today} date : nhập vào giá trị date muốn hiện lịch
 ==================================================================*/
var Calendar = function (model, options, date) {
    // Khai báo các giá trị mặc định 
    this.Options = {
        // Màu chữ
        Color: '',
        // Hiển thị arrow chuyển ngày, tháng, năm 
        NavShow: true,
        // Hiển thị danh sách tháng - khi enable thì NavShow = false
        NavVertical: false,
        // Hiển thị thẻ ngày, tháng, năm + 2 arrow
        DateTimeShow: true,
        // Định dạng ngày -- không hoạt động ??? 
        DateTimeFormat: 'mmm, yyyy',
        // Danh sách ngày bị disable
        DisableDays: [],
        // I don't know what it is !!! 
        // ModelChange: model
    }
    // Thay đổi các giá trị mặc định (Options)
    for (var key in options) {
        this.Options[key] = typeof options[key] == 'string' ? options[key].toLowerCase() : options[key];
    }

    // ??????
    model ? this.Model = model : this.Model = {};

    // Lấy ngày hnay
    this.Today = new Date();

    this.Selected = this.Today;
    this.Today.Month = this.Today.getMonth();
    this.Today.Year = this.Today.getFullYear();
    // Nếu nhập date thì gán giá trị select cho date 
    if (date) {
        this.Selected = date
    }
    this.Selected.Month = this.Selected.getMonth();
    this.Selected.Year = this.Selected.getFullYear();

    // Lấy số ngày trong tháng
    this.Selected.Days = new Date(this.Selected.Year, (this.Selected.Month + 1), 0).getDate();
    // Lấy thứ đầu của tháng
    this.Selected.FirstDay = new Date(this.Selected.Year, (this.Selected.Month), 1).getDay();
    // Lấy thứ cuối của tháng
    this.Selected.LastDay = new Date(this.Selected.Year, (this.Selected.Month + 1), 0).getDay();

    //Tháng sau !!
    this.Prev = new Date(this.Selected.Year, (this.Selected.Month + 1), 1);
    //Ngày 1 tháng trước 
    // this.PrevMonth = new Date(this.Selected.Year, (this.Selected.Month - 1), 1);

    // Nếu là tháng 1 thì tháng trước = lùi năm 
    // if (this.Selected.Month == 0) {
    //     //Tháng 12 năm trước ?
    //     this.Prev = new Date(this.Selected.Year - 1, 11, 1)
    // }

    // Lấy số ngày của tháng trước - tháng trước trước của tháng sau
    this.Prev.Days = new Date(this.Prev.getFullYear(), (this.Prev.getMonth() - 1), 0).getDate();
}

/**=======================================================================
 * Khởi tạo giao diện
 * @param {*} calendar : Lấy dữ liệu Date
 * @param {*} element : Element cần gắn giao diện
 * @param {number} adjuster : Chênh lệch (Tháng hiển thị - tháng hiện tại)
 ========================================================================*/
function createCalendar(calendar, element, adjuster) {
    // Nếu nhập giá trị adjuster thì hiển thị dữ liệu của tháng (hiện tại + adjuster)
    if (typeof adjuster !== 'undefined') {
        var newDate = new Date(calendar.Selected.Year, calendar.Selected.Month + adjuster, 1);
        calendar = new Calendar(calendar.Model, calendar.Options, newDate);
        element.innerHTML = '';
    } else {
        //   Chịu cmnl 
        for (var key in calendar.Options) {
            typeof calendar.Options[key] != 'function' && typeof calendar.Options[key] != 'object' && calendar.Options[key] ? element.className += " " + key + "-" + calendar.Options[key] : 0;
        }
    }

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Danh sách tháng - xử lí sau - line 66 source
    function AddSidebar() { }

    // Tạo thẻ + class - nghiên cứu đối tượng động html
    var mainSection = document.createElement('div');
    mainSection.className += "cld-main";

    // Tạo thẻ ngày, tháng, năm + 2 arrow
    function AddDateTime() {
        var datetime = document.createElement('div');
        datetime.className += "cld-datetime";
        if (calendar.Options.NavShow && !calendar.Options.NavVertical) {
            var rwd = document.createElement('div');
            rwd.className += " cld-rwd cld-nav";
            rwd.addEventListener('click', function () { createCalendar(calendar, element, -1); });
            rwd.innerHTML = '<svg height="15" width="15" viewBox="0 0 75 100" fill="rgba(0,0,0,0.5)"><polyline points="0,50 75,0 75,100"></polyline></svg>';
            datetime.appendChild(rwd);
        }
        var today = document.createElement('div');
        today.className += ' weekToday';
        today.innerHTML = months[calendar.Selected.Month] + " " + calendar.Selected.Year;
        datetime.appendChild(today);
        if (calendar.Options.NavShow && !calendar.Options.NavVertical) {
            var fwd = document.createElement('div');
            fwd.className += " cld-fwd cld-nav";
            fwd.addEventListener('click', function () { createCalendar(calendar, element, 1); });
            fwd.innerHTML = '<svg height="15" width="15" viewBox="0 0 75 100" fill="rgba(0,0,0,0.5)"><polyline points="0,0 75,50 0,100"></polyline></svg>';
            datetime.appendChild(fwd);
        }

        document.getElementById('datetime').innerHTML = "";
        document.getElementById('datetime').appendChild(datetime);
    }
    // Tạo thẻ các thứ trong tuần
    function AddLabels() {
        var labels = document.createElement('ul');
        labels.className = 'cld-labels';
        var labelsList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thusday", "Friday", "Saturday"];
        for (var i = 0; i < labelsList.length; i++) {
            var label = document.createElement('li');
            label.className += "cld-label";
            label.innerHTML = labelsList[i];
            labels.appendChild(label);
        }
        mainSection.appendChild(labels);
    }

    // Tạo bảng các ngày trong tháng
    async function AddDays() {
        // Create Number Element
        function DayNumber(n) {
            var number = document.createElement('p');
            number.className += "cld-number";
            number.innerHTML += n;
            return number;
        }
        var days = document.createElement('ul');
        days.className += "cld-days";

        // ===============
        // Previous Month's Days
        for (var i = 0; i < (calendar.Selected.FirstDay); i++) {
            var day = document.createElement('li');
            day.className += "cld-day prevMonth";
            // =====================================================================================
            var curDay = new Date(calendar.Selected.Year, calendar.Selected.Month - 1, (calendar.Prev.Days - calendar.Selected.FirstDay) + (i + 1));
            day.id += curDay;
            // day.id += (i + 1) + " " + (calendar.Selected.Month + 1) + " " + calendar.Selected.Year;
            // =====================================================================================

            var number = DayNumber((calendar.Prev.Days - calendar.Selected.FirstDay) + (i + 1));
            day.appendChild(number);
            // Lấy events 
            var events = [];
            events = await GetEvent(curDay);
            if(events.length != 0){
                for(var j = 0; j < events.length; j++){
                    var event = document.createElement('div');
                    event.className += "event-wrap";

                    var timeEv = document.createElement('div');
                    timeEv.className += "date-event";

                    var timeStart = document.createElement('div');
                    timeStart.className += "hour-event";
                    timeStart.id += "timeStart";
                    timeStart.innerHTML += events[j].timeStart;

                    var timeEnd = document.createElement('div');
                    timeEnd.className += "hour-event";
                    timeEnd.id += "timeEnd";
                    timeEnd.innerHTML += events[j].timeEnd;

                    var titleEv = document.createElement('div');
                    titleEv.className += "title-event";
                    titleEv.id = events[j].id;
                    titleEv.setAttribute('onclick','showEditModal(this)');
                    titleEv.setAttribute('data-id', events[j].id);
                    titleEv.setAttribute('data-name', events[j].title);
                    titleEv.setAttribute('data-description', events[j].description);
                    titleEv.setAttribute('data-date', events[j].day);
                    titleEv.setAttribute('data-timeStart', events[j].timeStart);
                    titleEv.setAttribute('data-timeEnd', events[j].timeEnd);
                    titleEv.setAttribute('data-location', events[j].location);
                    titleEv.setAttribute('data-public', events[j].private);
                    titleEv.setAttribute('data-done', events[j].done);
                    if (events[j].done) titleEv.className += " title-event-done";
                    titleEv.setAttribute('data-owner', events[j].owner);
                    if (!events[j].owner) titleEv.className += " title-event-other";
                    titleEv.innerHTML += events[j].title;

                    timeEv.appendChild(timeStart);
                    timeEv.appendChild(timeEnd);
                    event.appendChild(timeEv);
                    event.appendChild(titleEv);
                    day.appendChild(event);
                }
            }

            days.appendChild(day);
        }
        // =================================
        // Current Month's Days
        for (var i = 0; i < calendar.Selected.Days; i++) {
            var day = document.createElement('li');
            day.className += "cld-day currMonth";
            // =====================================================================================
            var curDay = new Date(calendar.Selected.Year, calendar.Selected.Month, i + 1)
            day.id += curDay;
            // day.id += (i + 1) + " " + (calendar.Selected.Month + 1) + " " + calendar.Selected.Year;
            // =====================================================================================

            var number = DayNumber(i + 1);
            // =================================
            // Check Date against Event Dates
            for (var n = 0; n < calendar.Model.length; n++) {
                var evDate = calendar.Model[n].Date;
                var toDate = new Date(calendar.Selected.Year, calendar.Selected.Month, (i + 1));
                if (evDate.getTime() == toDate.getTime()) {
                    number.className += " eventday";
                    var title = document.createElement('span');
                    title.className += "cld-title";
                    if (typeof calendar.Model[n].Link == 'function' || calendar.Options.EventClick) {
                        var a = document.createElement('a');
                        a.setAttribute('href', '#');
                        a.innerHTML += calendar.Model[n].Title;
                        if (calendar.Options.EventClick) {
                            var z = calendar.Model[n].Link;
                            if (typeof calendar.Model[n].Link != 'string') {
                                a.addEventListener('click', calendar.Options.EventClick.bind.apply(calendar.Options.EventClick, [null].concat(z)));
                                if (calendar.Options.EventTargetWholeDay) {
                                    day.className += " clickable";
                                    day.addEventListener('click', calendar.Options.EventClick.bind.apply(calendar.Options.EventClick, [null].concat(z)));
                                }
                            } else {
                                a.addEventListener('click', calendar.Options.EventClick.bind(null, z));
                                if (calendar.Options.EventTargetWholeDay) {
                                    day.className += " clickable";
                                    day.addEventListener('click', calendar.Options.EventClick.bind(null, z));
                                }
                            }
                        } else {
                            a.addEventListener('click', calendar.Model[n].Link);
                            if (calendar.Options.EventTargetWholeDay) {
                                day.className += " clickable";
                                day.addEventListener('click', calendar.Model[n].Link);
                            }
                        }
                        title.appendChild(a);
                    } else {
                        title.innerHTML += '<a href="' + calendar.Model[n].Link + '">' + calendar.Model[n].Title + '</a>';
                    }
                    number.appendChild(title);
                }
            }
            // =================================
            day.appendChild(number);
            // If Today..
            if ((i + 1) == calendar.Today.getDate() && calendar.Selected.Month == calendar.Today.Month && calendar.Selected.Year == calendar.Today.Year) {
                day.className += " today";
            }

            // Lấy events 
            var events = [];
            events = await GetEvent(curDay);
            if(events.length != 0){
                for(var j = 0; j < events.length; j++){
                    var event = document.createElement('div');
                    event.className += "event-wrap";

                    var timeEv = document.createElement('div');
                    timeEv.className += "date-event";

                    var timeStart = document.createElement('div');
                    timeStart.className += "hour-event";
                    timeStart.id += "timeStart";
                    timeStart.innerHTML += events[j].timeStart;

                    var timeEnd = document.createElement('div');
                    timeEnd.className += "hour-event";
                    timeEnd.id += "timeEnd";
                    timeEnd.innerHTML += events[j].timeEnd;

                    var titleEv = document.createElement('div');
                    titleEv.className += "title-event";
                    titleEv.id = events[j].id;
                    titleEv.setAttribute('onclick','showEditModal(this)');
                    titleEv.setAttribute('data-id', events[j].id);
                    titleEv.setAttribute('data-name', events[j].title);
                    titleEv.setAttribute('data-description', events[j].description);
                    titleEv.setAttribute('data-date', events[j].day);
                    titleEv.setAttribute('data-timeStart', events[j].timeStart);
                    titleEv.setAttribute('data-timeEnd', events[j].timeEnd);
                    titleEv.setAttribute('data-location', events[j].location);
                    titleEv.setAttribute('data-public', events[j].private);
                    titleEv.setAttribute('data-done', events[j].done);
                    if (events[j].done) titleEv.className += " title-event-done";
                    titleEv.setAttribute('data-owner', events[j].owner);
                    if (!events[j].owner) titleEv.className += " title-event-other";
                    titleEv.innerHTML += events[j].title;

                    timeEv.appendChild(timeStart);
                    timeEv.appendChild(timeEnd);
                    event.appendChild(timeEv);
                    event.appendChild(titleEv);
                    day.appendChild(event);
                }
            }

            days.appendChild(day);
        }
        // ====================
        // Next Month's Days
        // Always same amount of days in calander
        var extraDays = 13;
        if (days.children.length > 35) { extraDays = 6; }
        else if (days.children.length < 29) { extraDays = 20; }

        for (var i = 0; i < (extraDays - calendar.Selected.LastDay); i++) {
            var day = document.createElement('li');
            day.className += "cld-day nextMonth";
            
            var curDay = new Date(calendar.Selected.Year, calendar.Selected.Month + 1, i + 1)
            day.id += curDay;
            

            var number = DayNumber(i + 1);
            day.appendChild(number);

            // Lấy events 
            var events = [];
            events = GetEvent(curDay);
            if(events.length != 0){
                for(var j = 0; j < events.length; j++){
                    var event = document.createElement('div');
                    event.className += "event-wrap";

                    var timeEv = document.createElement('div');
                    timeEv.className += "date-event";

                    var timeStart = document.createElement('div');
                    timeStart.className += "hour-event";
                    timeStart.id += "timeStart";
                    timeStart.innerHTML += events[j].timeStart;

                    var timeEnd = document.createElement('div');
                    timeEnd.className += "hour-event";
                    timeEnd.id += "timeEnd";
                    timeEnd.innerHTML += events[j].timeEnd;

                    var titleEv = document.createElement('div');
                    titleEv.className += "title-event";
                    titleEv.id = events[j].id;
                    titleEv.setAttribute('onclick','showEditModal(this)');
                    titleEv.setAttribute('data-id', events[j].id);
                    titleEv.setAttribute('data-name', events[j].title);
                    titleEv.setAttribute('data-description', events[j].description);
                    titleEv.setAttribute('data-date', events[j].day);
                    titleEv.setAttribute('data-timeStart', events[j].timeStart);
                    titleEv.setAttribute('data-timeEnd', events[j].timeEnd);
                    titleEv.setAttribute('data-location', events[j].location);
                    titleEv.setAttribute('data-public', events[j].private);
                    titleEv.setAttribute('data-done', events[j].done);
                    if (events[j].done) titleEv.className += " title-event-done";
                    titleEv.setAttribute('data-owner', events[j].owner);
                    if (!events[j].owner) titleEv.className += " title-event-other";
                    titleEv.innerHTML += events[j].title;

                    timeEv.appendChild(timeStart);
                    timeEv.appendChild(timeEnd);
                    event.appendChild(timeEv);
                    event.appendChild(titleEv);
                    day.appendChild(event);
                }
            }

            days.appendChild(day);
        }
        mainSection.appendChild(days);
    }
    // ==========================================
    if (calendar.Options.Color) {
        mainSection.innerHTML += '<style>.cld-main{color:' + calendar.Options.Color + ';}</style>';
    }
    element.appendChild(mainSection);

    if (calendar.Options.NavShow && calendar.Options.NavVertical) {
        AddSidebar();
    }
    if (calendar.Options.DateTimeShow) {
        AddDateTime();
    }
    AddLabels();
    AddDays();
}
/**=============================================
 * Khởi tạo calendar
 * @param {*} el 
 * @param {*} data 
 * @param {*} settings 
 ==============================================*/
function initCalendar(el, data, settings) {
    // hàm Calendar không nhập date để hệ thống tự lấy ngày hiện tại
    var obj = new Calendar(data, settings);
    createCalendar(obj, el, 0);
}