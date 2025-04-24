// Store data for entry and exit
const dateData = {
    entry: {
      date: new Date(2025, 3, 24), // April 24, 2025
      hour: "04",
      minute: "15",
      ampm: "PM"
    },
    exit: {
      date: new Date(2025, 3, 25), // April 25, 2025
      hour: "04",
      minute: "15",
      ampm: "PM"
    }
  };
  
  // Initialize on page load
  document.addEventListener("DOMContentLoaded", function() {
    // Render calendars
    renderCalendar('entry');
    renderCalendar('exit');
    
    // Update displays
    updateDisplay('entry');
    updateDisplay('exit');
    
    // Hide time selectors initially
    document.getElementById('entryTimeSelectorContainer').style.display = 'none';
    document.getElementById('exitTimeSelectorContainer').style.display = 'none';
    
    // Set up event listeners
    document.getElementById('entryDropdownContent').addEventListener('click', function() {
      toggleDatepicker('entry');
    });
    
    document.getElementById('exitDropdownContent').addEventListener('click', function() {
      toggleDatepicker('exit');
    });
    
    document.getElementById('entryPrevMonth').addEventListener('click', function(e) {
      prevMonth('entry');
      e.stopPropagation();
    });
    
    document.getElementById('entryNextMonth').addEventListener('click', function(e) {
      nextMonth('entry');
      e.stopPropagation();
    });
    
    document.getElementById('exitPrevMonth').addEventListener('click', function(e) {
      prevMonth('exit');
      e.stopPropagation();
    });
    
    document.getElementById('exitNextMonth').addEventListener('click', function(e) {
      nextMonth('exit');
      e.stopPropagation();
    });
    
    document.getElementById('entryOkButton').addEventListener('click', function() {
      closeDatepicker('entry');
    });
    
    document.getElementById('exitOkButton').addEventListener('click', function() {
      closeDatepicker('exit');
    });
    
    // Add handlers for time selector inputs
    document.getElementById('entryHour').addEventListener('change', function() {
      updateTime('entry');
    });
    
    document.getElementById('entryMinute').addEventListener('change', function() {
      updateTime('entry');
    });
    
    document.getElementById('entryAmPm').addEventListener('change', function() {
      updateTime('entry');
    });
    
    document.getElementById('exitHour').addEventListener('change', function() {
      updateTime('exit');
    });
    
    document.getElementById('exitMinute').addEventListener('change', function() {
      updateTime('exit');
    });
    
    document.getElementById('exitAmPm').addEventListener('change', function() {
      updateTime('exit');
    });
    
    // Close datepickers when clicking outside
    document.addEventListener('click', function(event) {
      const entryDropdown = document.getElementById('entryDropdown');
      const exitDropdown = document.getElementById('exitDropdown');
      
      if (!entryDropdown.contains(event.target)) {
        document.getElementById('entryDatepicker').style.display = 'none';
        document.getElementById('entryTimeSelectorContainer').style.display = 'none';
      }
      
      if (!exitDropdown.contains(event.target)) {
        document.getElementById('exitDatepicker').style.display = 'none';
        document.getElementById('exitTimeSelectorContainer').style.display = 'none';
      }
    });
    
    // Add resize event listener to adjust time selector position on window resize
    window.addEventListener('resize', function() {
      // Reposition time selectors if visible
      if (document.getElementById('entryTimeSelectorContainer').style.display === 'block') {
        const selectedCell = document.querySelector('#entryCalendarDays .day-cell.selected');
        if (selectedCell) {
          positionTimeSelector('entry', selectedCell);
        }
      }
      
      if (document.getElementById('exitTimeSelectorContainer').style.display === 'block') {
        const selectedCell = document.querySelector('#exitCalendarDays .day-cell.selected');
        if (selectedCell) {
          positionTimeSelector('exit', selectedCell);
        }
      }
    });
  });
  
  function renderCalendar(type) {
    const date = dateData[type].date;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Update month label
    document.getElementById(`${type}MonthLabel`).textContent = 
      date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay() || 7; // Convert Sunday (0) to 7 for European style
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Clear previous calendar
    const calendarEl = document.getElementById(`${type}CalendarDays`);
    
    // Preserve weekday headers
    const weekdays = calendarEl.querySelectorAll('.weekday');
    calendarEl.innerHTML = '';
    weekdays.forEach(weekday => calendarEl.appendChild(weekday));
    
    // Add days from previous month
    for (let i = 1; i < firstDay; i++) {
      const day = daysInPrevMonth - firstDay + i + 1;
      addDayCell(calendarEl, day, type, true, new Date(year, month - 1, day));
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      addDayCell(calendarEl, i, type, false, new Date(year, month, i));
    }
    
    // Add days from next month
    const cellsAdded = firstDay - 1 + daysInMonth;
    const cellsNeeded = Math.ceil(cellsAdded / 7) * 7;
    for (let i = 1; i <= cellsNeeded - cellsAdded; i++) {
      addDayCell(calendarEl, i, type, true, new Date(year, month + 1, i));
    }
    
    // Hide time selector when changing month
    document.getElementById(`${type}TimeSelectorContainer`).style.display = 'none';
  }
  
  function addDayCell(container, day, type, isOtherMonth, date) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isOtherMonth) cell.classList.add('other-month');
    cell.textContent = day;
    
    // Check if this is the selected date
    const selectedDate = dateData[type].date;
    if (date.getDate() === selectedDate.getDate() && 
        date.getMonth() === selectedDate.getMonth() && 
        date.getFullYear() === selectedDate.getFullYear()) {
      cell.classList.add('selected');
    }
    
    cell.addEventListener('click', function(e) {
      // Hide any existing time selectors
      document.getElementById('entryTimeSelectorContainer').style.display = 'none';
      document.getElementById('exitTimeSelectorContainer').style.display = 'none';
      
      // Remove selected class from all cells in this calendar
      const allCells = container.querySelectorAll('.day-cell');
      allCells.forEach(c => {
        c.classList.remove('selected');
      });
      
      // Add selected class to clicked cell
      cell.classList.add('selected');
      
      // Update the date data
      dateData[type].date = new Date(date);
      
      // Position the time selector properly
      positionTimeSelector(type, cell);
      
      // Update display
      updateDisplay(type);
      
      // Prevent the click from closing the datepicker
      e.stopPropagation();
    });
    
    container.appendChild(cell);
  }
  
  function positionTimeSelector(type, cell) {
// Get the cell coordinates and dimensions
const cellRect = cell.getBoundingClientRect();
const datepickerRect = document.getElementById(`${type}Datepicker`).getBoundingClientRect();

// Get the time selector
const timeSelector = document.getElementById(`${type}TimeSelectorContainer`);
const timeSelectorArrow = timeSelector.querySelector('.time-selector-arrow');

// Calculate the row this cell is in
const cells = Array.from(document.getElementById(`${type}CalendarDays`).querySelectorAll('.day-cell'));
const index = cells.indexOf(cell);
const row = Math.floor(index / 7);
const lastRowIndex = Math.floor((cells.length - 1) / 7);

// Check if we're on mobile
const isMobile = window.innerWidth <= 768;

if (isMobile) {
  // For mobile views, position the time selector exactly 30px below the cell
  timeSelector.style.top = `${cellRect.bottom - datepickerRect.top -45}px`;
  
  // Adjust arrow to point up and position it exactly
  timeSelectorArrow.style.bottom = 'auto';
  timeSelectorArrow.style.top = '-10px';
  timeSelectorArrow.style.borderBottom = '10px solid #003366';
  timeSelectorArrow.style.borderTop = 'none';
} else {
  // Desktop positioning logic
  if (row === lastRowIndex) {
    // If it's the last row, place the time selector above with exact 30px distance
    timeSelector.style.top = `${cellRect.top - datepickerRect.top - timeSelector.offsetHeight - 10}px`;
    
    // Adjust arrow to point down
    timeSelectorArrow.style.top = 'auto';
    timeSelectorArrow.style.bottom = '-10px';
    timeSelectorArrow.style.borderTop = '10px solid #003366';
    timeSelectorArrow.style.borderBottom = 'none';


  } else {
    // Normal case - place time selector exactly 30px below the cell
    timeSelector.style.top = `${cellRect.bottom - datepickerRect.top + 70}px`;
    
    // Adjust arrow to point up
    timeSelectorArrow.style.bottom = 'auto';
    timeSelectorArrow.style.top = '-10px';
    timeSelectorArrow.style.borderBottom = '10px solid #003366';
    timeSelectorArrow.style.borderTop = 'none';
  }
}

// Center the arrow exactly under/above the selected date cell
const arrowLeftPosition = cellRect.left + (cellRect.width / 2) - datepickerRect.left;
timeSelectorArrow.style.left = `${arrowLeftPosition}px`;
timeSelectorArrow.style.transform = 'translateX(-50%)'; // Fix it to consistent -50%

// Show the time selector
timeSelector.style.display = 'block';
}
  function updateDisplay(type) {
    const data = dateData[type];
    document.getElementById(`${type}Day`).textContent = data.date.getDate();
    document.getElementById(`${type}MonthYear`).textContent = 
      data.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById(`${type}Time`).textContent = 
      `${data.hour}:${data.minute} ${data.ampm}`;
    
    // Update time selector value
    document.getElementById(`${type}Hour`).value = data.hour;
    document.getElementById(`${type}Minute`).value = data.minute;
    document.getElementById(`${type}AmPm`).value = data.ampm;
  }
  
  function updateTime(type) {
    const hour = document.getElementById(`${type}Hour`).value;
    const minute = document.getElementById(`${type}Minute`).value;
    const ampm = document.getElementById(`${type}AmPm`).value;
    
    dateData[type].hour = hour;
    dateData[type].minute = minute;
    dateData[type].ampm = ampm;
    
    updateDisplay(type);
  }
  
  function toggleDatepicker(type) {
    const picker = document.getElementById(`${type}Datepicker`);
    const timeSelector = document.getElementById(`${type}TimeSelectorContainer`);
    const otherType = type === 'entry' ? 'exit' : 'entry';
    const otherPicker = document.getElementById(`${otherType}Datepicker`);
    const otherTimeSelector = document.getElementById(`${otherType}TimeSelectorContainer`);
    
    // Close the other picker and time selector if open
    otherPicker.style.display = 'none';
    otherTimeSelector.style.display = 'none';
    
    // Toggle this picker
    if (picker.style.display === 'block') {
      picker.style.display = 'none';
      timeSelector.style.display = 'none';
    } else {
      picker.style.display = 'block';
      
      // If there's a selected date, show the time selector
      const selectedCell = picker.querySelector('.day-cell.selected');
      if (selectedCell) {
        // Trigger a click on the selected cell to position and show the time selector
        positionTimeSelector(type, selectedCell);
      }
    }
  }
  
  function closeDatepicker(type) {
    document.getElementById(`${type}Datepicker`).style.display = 'none';
    document.getElementById(`${type}TimeSelectorContainer`).style.display = 'none';
  }
  
  function prevMonth(type) {
    const date = dateData[type].date;
    date.setMonth(date.getMonth() - 1);
    renderCalendar(type);
  }
  
  function nextMonth(type) {
    const date = dateData[type].date;
    date.setMonth(date.getMonth() + 1);
    renderCalendar(type);
  }