import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://bigligasbeautybarberstudio.netlify.app']
      : true,
    credentials: true,
  },
})
export class BookingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  notifyNewBooking(booking: any) {
    // Solo emitir si hay servidor y clientes conectados
    if (this.server) {
      try {
        this.server.emit('newBooking', booking);
      } catch (error) {
        // Si falla la notificación WebSocket, no es crítico, solo loguear
        console.error('Error al notificar nueva reserva por WebSocket:', error);
      }
    }
  }
}
