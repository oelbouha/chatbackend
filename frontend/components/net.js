

export const websocket = new WebSocket("ws://127.0.0.1:8000/ws/chat/room/");

export function sendMessage(message) {
	// code
}


export async function getData(user1, user2) {
	const url = `http://127.0.0.1:8000/messages/?user1=${user1}&user2=${user2}`;
	try {
	  const response = await fetch(url);
	  if (!response.ok) {
		  throw new Error(`Response status: ${response.status}`);
		}
		
		const body = await response.json();
		if (body.message == "Invalid request: user1 and user2 are required")
			return null
		return body
	}
	catch (error) {
		console.error(error.message);
		return null
	}
}

export function getCurrentTime() {
    const now = Date.now();
    const formattedTime = new Date(now).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
    return formattedTime
}


export function formatTime(time, format = '12-hour') {
    // Check if the input is already in 12-hour format (HH:mm AM/PM)
    const twelveHourRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;
    const match = time.match(twelveHourRegex);
    
    if (match) {
        const [_, hours, minutes, meridiem] = match;
        
        if (format === '24-hour') {
            // Convert from 12-hour to 24-hour
            let hour = parseInt(hours);
            if (meridiem === 'PM' && hour !== 12) hour += 12;
            if (meridiem === 'AM' && hour === 12) hour = 0;
            return `${String(hour).padStart(2, '0')}:${minutes}`;
        }
        return time; // Return as-is if already in 12-hour format and 12-hour is requested
    }
    
    // Check if input is in 24-hour format (HH:mm)
    const twentyFourHourRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const match24 = time.match(twentyFourHourRegex);
    
    if (match24) {
        const [_, hours, minutes] = match24;
        let hour = parseInt(hours);
        
        if (format === '12-hour') {
            // Convert from 24-hour to 12-hour
            const meridiem = hour >= 12 ? 'PM' : 'AM';
            if (hour > 12) hour -= 12;
            if (hour === 0) hour = 12;
            return `${hour}:${minutes} ${meridiem}`;
        }
        return `${String(hour).padStart(2, '0')}:${minutes}`; // Return as-is if 24-hour format is requested
    }
    
    // Try parsing as ISO string if neither format matches
    try {
        const date = new Date(time);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const hours = date.getUTCHours();
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        
        if (format === '12-hour') {
            const meridiem = hours >= 12 ? 'PM' : 'AM';
            const hour = hours % 12 || 12;
            return `${hour}:${minutes} ${meridiem}`;
        } else {
            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }
    } catch (error) {
        return 'Invalid date';
    }
}