

export const websocket = new WebSocket("ws://127.0.0.1:8000/ws/chat/room/");

export function sendMessage(message) {
	// code
}


export async function getData() {
	const url = "http://127.0.0.1:8000/messages/?user1=4&user2=3";
	try {
	  const response = await fetch(url);
	  if (!response.ok) {
		throw new Error(`Response status: ${response.status}`);
	  }
  
	  const json = await response.json();
	  return json
	} catch (error) {
	  console.error(error.message);
	}
}