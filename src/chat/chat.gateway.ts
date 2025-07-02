import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({cors: true})
export class ChatGateway  implements OnGatewayConnection , OnGatewayDisconnect{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected ${client.id}  ${client.handshake.time}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected ${ client.id }  ${ new Date().toLocaleDateString()}`);
  }

  @SubscribeMessage('send-message')
  handleMessage(@MessageBody() payload: MessageDto) {
    const newMessage = this.chatService.sendMessage(payload.username, payload.message);
    this.server.emit('new-message', newMessage)
  }

  @SubscribeMessage('delete-message')
  handleDeleteMessage(@MessageBody() messageid: string) {
    const success = this.chatService.deleteMessage(messageid);
    if(success) {
      this.server.emit('message-deleted', messageid)
    }
  }
}
