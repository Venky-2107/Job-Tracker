from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        
    # accept the connection and append 
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        
    # remove the connection
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    # loop and send to all connections 
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
            
# instantiate the connection manager   
manager = ConnectionManager()