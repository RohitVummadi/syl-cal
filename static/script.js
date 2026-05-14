document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('pdfFile');
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const downloadBtn = document.getElementById('downloadBtn');
    const calendarEl = document.getElementById('calendar');
    const addEventForm = document.getElementById('add-event-form');
    const eventsList = document.getElementById('events-list');
    
    let calendar;
    let allEvents = []; // Store raw events for ICS generation

    // Function to render the simple text list summary
    function renderEventsSummary() {
        eventsList.innerHTML = ''; // Clear current
        
        if (allEvents.length === 0) {
            eventsList.innerHTML = '<li>No events found or added yet.</li>';
            return;
        }

        // Sort by date chronologically
        const sortedEvents = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedEvents.forEach((ev, index) => {
            const timeText = ev.time ? ` at ${ev.time}` : '';
            const estWarning = ev.estimated ? `<br><small style="color: #d9534f;">⚠️ Estimated date (based on week number)</small>` : '';
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${ev.date}${timeText}</strong> - ${ev.description} ${estWarning}</span>
                <div>
                    <span class="event-badge">${ev.type}</span>
                    <button class="delete-btn" data-id="${ev._id}">Remove</button>
                </div>
            `;
            eventsList.appendChild(li);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToRemove = e.target.getAttribute('data-id');
                removeEvent(idToRemove);
            });
        });
    }

    function removeEvent(id) {
        // Remove from our global array
        allEvents = allEvents.filter(ev => ev._id !== id);
        
        // Remove from the calendar visual component
        const calendarEvent = calendar.getEventById(id);
        if (calendarEvent) {
            calendarEvent.remove();
        }
        
        // Re-render the summary list
        renderEventsSummary();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const files = fileInput.files;
        if (files.length === 0) return;

        // UI Reset
        submitBtn.disabled = true;
        loadingDiv.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        
        const startDate = document.getElementById('startDate').value;
        const customInstructions = document.getElementById('customInstructions').value;

        const formData = new FormData();
        formData.append('startDate', startDate);
        formData.append('customInstructions', customInstructions);
        // Append all selected files to the form data
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Server error');
            }

            // Assign unique IDs to events for easy manipulation later
            const processedEvents = data.events.map(ev => ({
                ...ev,
                _id: 'evt_' + Math.random().toString(36).substr(2, 9)
            }));

            // Save events array globally
            allEvents = processedEvents;
            
            // Format events for FullCalendar
            const calendarEvents = allEvents.map(ev => {
                const isAllDay = !ev.time;
                const startStr = ev.time ? `${ev.date}T${ev.time}` : ev.date;
                const displayTitle = ev.estimated ? `${ev.description}*` : ev.description;
                
                return {
                    id: ev._id,
                    title: displayTitle,
                    start: startStr,
                    allDay: isAllDay,
                    className: `event-type-${ev.type}`,
                    extendedProps: {
                        type: ev.type,
                        time: ev.time,
                        description: ev.description,
                        estimated: ev.estimated
                    }
                };
            });

            // Initialize or update calendar
            resultsSection.classList.remove('hidden');
            
            // Render the summary list
            renderEventsSummary();
            
            if (calendar) {
                calendar.destroy();
            }
            
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                events: calendarEvents,
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,listMonth'
                },
                // Jump to the date of the first event if available
                initialDate: calendarEvents.length > 0 ? calendarEvents[0].start : new Date(),
                eventClick: function(info) {
                    const props = info.event.extendedProps;
                    const dateStr = info.event.start.toLocaleDateString();
                    const timeStr = props.time || 'All Day';
                    const estWarn = props.estimated ? "\n⚠️ Note: This date is an estimate based on the week number." : "";
                    
                    alert(`Event: ${props.description}\nDate: ${dateStr}\nTime: ${timeStr}\nType: ${props.type}${estWarn}`);
                }
            });
            
            calendar.render();

        } catch (error) {
            alert('Error extracting events: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            loadingDiv.classList.add('hidden');
        }
    });

    // Handle adding custom manual events
    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('eventName');
        const dateInput = document.getElementById('eventDate');
        const typeInput = document.getElementById('eventType');
        const timeInput = document.getElementById('eventTime');

        const newEvent = {
            _id: 'evt_' + Math.random().toString(36).substr(2, 9),
            description: nameInput.value,
            date: dateInput.value,
            time: timeInput.value || null,
            type: typeInput.value || 'other',
            estimated: false
        };

        // Add to our global list
        allEvents.push(newEvent);

        // Update the summary text list
        renderEventsSummary();

        // Add to the visual calendar
        if (calendar) {
            const isAllDay = !newEvent.time;
            const startStr = newEvent.time ? `${newEvent.date}T${newEvent.time}` : newEvent.date;
            
            calendar.addEvent({
                id: newEvent._id,
                title: newEvent.description,
                start: startStr,
                allDay: isAllDay,
                className: `event-type-${newEvent.type}`,
                extendedProps: {
                    type: newEvent.type,
                    time: newEvent.time,
                    description: newEvent.description
                }
            });
        }

        // Reset the inputs
        nameInput.value = '';
        dateInput.value = '';
        timeInput.value = '';
    });

    // Setup Download button
    downloadBtn.addEventListener('click', async () => {
        if (allEvents.length === 0) {
            alert("No events to download!");
            return;
        }

        const btnOriginalText = downloadBtn.innerText;
        downloadBtn.disabled = true;
        downloadBtn.innerText = "Generating...";

        try {
            // Ask the server to generate a fresh ICS file based on all current events
            const response = await fetch('/api/generate_ics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: allEvents })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Server error generating calendar');
            }

            const blob = new Blob([data.ics], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'syllabus_events.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Error creating download: ' + error.message);
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerText = btnOriginalText;
        }
    });
});
