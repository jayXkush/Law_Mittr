// Simple WebSocket signaling server for WebRTC (using ws)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

// Map to keep track of users in rooms (appointmentId as room)
const rooms = {};

wss.on('connection', (ws) => {
  let currentRoom = null;
  let userId = null;

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
      return;
    }

    switch (data.type) {
      case 'join':
        // data: { type: 'join', room: appointmentId, userId }
        currentRoom = data.room;
        userId = data.userId;
        if (!rooms[currentRoom]) rooms[currentRoom] = [];
        rooms[currentRoom].push(ws);
        ws.send(JSON.stringify({ type: 'joined', room: currentRoom, userId }));
        break;
      case 'signal':
        // data: { type: 'signal', room, userId, signal }
        if (rooms[data.room]) {
          rooms[data.room].forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'signal',
                userId: data.userId,
                signal: data.signal,
              }));
            }
          });
        }
        break;
      case 'leave':
        // data: { type: 'leave', room, userId }
        if (rooms[data.room]) {
          rooms[data.room] = rooms[data.room].filter((client) => client !== ws);
        }
        ws.close();
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter((client) => client !== ws);
      if (rooms[currentRoom].length === 0) delete rooms[currentRoom];
    }
  });
});

console.log('WebSocket signaling server running on ws://localhost:8081');
