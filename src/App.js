import React, { Component} from 'react';
import {hot} from "react-hot-loader";
import IO from 'socket.io-client';
import Moment from 'moment';

import './App.scss';

import Messages from './Messages.js';
import MessageForm from './MessageForm.js';
import Buddylist from './Buddylist.js';
import NickDialog from './NickDialog.js';
import SystemMessageType from './SystemMessageType.js';

class App extends Component {

	constructor() {
		super()

		this.state = {
			mySocketId: null,
			myNick: null,
			messages: new Map(),
			buddylist: new Map(),
			socketIdForNickUpdate: null
		};

		this.socket = null;

		this.systemNick = 'Mü-Chat';
		this.systemMessageCount = 0;

		this.streamMessage = this.streamMessage.bind(this);
		this.endMessageStream = this.endMessageStream.bind(this);
		this.deleteMessageStream = this.deleteMessageStream.bind(this);
		this.requestNickUpdate = this.requestNickUpdate.bind(this);
		this.openNickDialog = this.openNickDialog.bind(this);
		this.closeNickDialog = this.closeNickDialog.bind(this);
		this.generateSystemMessage = this.generateSystemMessage.bind(this);
		this.isMe = this.isMe.bind(this);
	}

	componentDidMount() {
		this.socket = IO.connect(':8081');

		// You connected.
		this.socket.on('connect', () => {
			this.socket.emit('clientConnection' ); // server will assign a default nick
			
			this.setState({
				mySocketId: this.socket.id
			})
		});

		// Server registers a connection (you, other clients)
		this.socket.on('serverConnectionResponse', (data) => {
			if (!this.isMe(data.socketId)) {
				return;
			}

			// Local messages for you, these messages are not stored on the server.
			let splashScreenMessage = this.generateSystemMessage('', SystemMessageType.SPLASH_SCREEN);

			let welcomeMessage = this.generateSystemMessage(
				`Welcome to Mü-Chat!  Your nickname is ${data.nick}.  Please feel free to change it.`,
				SystemMessageType.WELCOME
			);

			this.state.messages = new Map(data.messageHistory);
			this.state.messages.set(splashScreenMessage.id, splashScreenMessage);
			this.state.messages.set(welcomeMessage.id, welcomeMessage);

			// Get you set up with your new nickname, message history, and local messages
			this.setState({
				myNick: data.nick,
				messages: this.state.messages
			});

			// Announce your arrival to the chat room
			let newConnectionMessage = this.generateSystemMessage(`${data.nick} is online.`, SystemMessageType.NOTIFICATION);
			this.socket.emit('clientBroadcastMessage', newConnectionMessage);
		});

		this.socket.on('serverDisconnectionResponse', (data) => {
			let disconnectionMessage = this.generateSystemMessage(`${data.nick} has disconnected.`, SystemMessageType.NOTIFICATION);
			this.socket.emit('clientLocalMessage', disconnectionMessage);
		});

		this.socket.on('serverMessageResponse', (message) => {
			this.state.messages.set(message.id, message);

			this.setState({
				messages: this.state.messages
			});
		});

		this.socket.on('serverMessageCancellationResponse', (messageId) => {
			this.state.messages.delete(messageId);

			this.setState({
				messages: this.state.messages
			});
		});

		this.socket.on('serverBuddylistUpdate', (data) => {
			this.setState({
				buddylist: new Map(data)
			});
		});

		this.socket.on('serverNickUpdate', (data) => {
			if (this.isMe(data.socketId)) {
				this.setState({
					myNick: data.newNick
				});
			}

			const nickUpdateMessage = this.generateSystemMessage(
				`${data.oldNick} shall now be known as ${data.newNick}.`,
				SystemMessageType.NOTIFICATION
			)
			
			this.socket.emit('clientLocalMessage', nickUpdateMessage);

			this.closeNickDialog();
		});

		this.socket.on('serverNickTaken', (nick) => {
			alert(`${nick} is already in use.`);
		});

		window.addEventListener('blur', () => {
			this.socket.emit('clientIsAway', this.state.mySocketId);
		});

		window.addEventListener('focus', () => {
			this.socket.emit('clientHasReturned', this.state.mySocketId);
		});
	}

	streamMessage(message) {
		this.socket.emit('clientMessage', message);
	}

	endMessageStream(messageId) {
		const message = this.state.messages.get(messageId);
		message.isActive = false;

		this.socket.emit('clientMessage', message);
	}

	deleteMessageStream(messageId) {
		this.state.messages.delete(messageId);

		this.socket.emit('clientMessageCancellation', messageId);
	}

	requestNickUpdate(newNick) {
		const socketId = this.state.socketIdForNickUpdate;
		const buddylist = this.state.buddylist;
		let buddy = buddylist.get(socketId);
		buddy.nick = newNick;

		this.socket.emit('clientNickUpdateRequest', buddy);
	}

	openNickDialog(socketId) {
		this.setState({
			socketIdForNickUpdate: socketId
		});
	}

	closeNickDialog() {
		this.setState({
			socketIdForNickUpdate: null
		});
	}

	generateSystemMessage(body, type) {
		return {
			id: this.systemNick + '-' + this.state.mySocketId + '-' + this.systemMessageCount++,
			nick: this.systemNick,
			time: Moment().format('HH:mm'),
			isActive: false,
			body: body,
			systemMessageType: type
		};
	}

	isMe(socketId) {
		return socketId === this.state.mySocketId;
	}

	handleLogoClick() {
		alert('[ Mü-Chat ]\nVersion: 2.0.0\nUpdated: 11/4/2018');
	}

	render() {
		if (!this.state.mySocketId) {
			return null;
		}

		const logo = `  /\\/\\
=( - -)=`;

		return(
			<div className="Chat">
				<div className="Chat-logo" onClick={this.handleLogoClick}>
					<pre>{logo}</pre>
					<span>Mü-Chat<br />v2.0</span>
				</div>
				<div className="Chat-body">
					<Messages
						messages={this.state.messages} />
					<Buddylist 
						mySocketId={this.state.mySocketId} 
						buddylist={this.state.buddylist} 
						openNickDialog={this.openNickDialog} />
				</div>
				<div className="Chat-footer">
					<MessageForm
						mySocketId={this.state.mySocketId} 
						myNick={this.state.myNick} 
						streamMessage={this.streamMessage} 
						endMessageStream={this.endMessageStream} 
						deleteMessageStream={this.deleteMessageStream} />	
				</div>			
				<NickDialog 
					socketIdForNickUpdate={this.state.socketIdForNickUpdate} 
					requestNickUpdate={this.requestNickUpdate} 
					closeNickDialog={this.closeNickDialog} />
			</div>
		);
	}
}

export default hot(module)(App);