import React, { Component} from 'react';
import Moment from 'moment';

class MessageForm extends Component {

    constructor() {
        super();

        this.state = {
            activeMessageBody: ''
        };

        this.messageId = null;
        this.messageCount = 0;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleChange(e) {
        this.setState({
            activeMessageBody: e.target.value
        });

        if (!this.messageId) {
            this.messageId = this.props.mySocketId + '-' + this.messageCount++;
        }

        const message = {
            id: this.messageId,
            socketId: this.props.mySocketId,
            nick: this.props.myNick,
            time: Moment().format('HH:mm'),
            body: e.target.value,
            isActive: true
        };

        this.props.streamMessage(message);
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.messageId) {
            return;
        }

        this.props.endMessageStream(this.messageId);

        this.messageId = null;
        
        this.setState({
            activeMessageBody: ''
        });
    }

    handleKeyDown(e) {
        if (!this.messageId) {
            return;
        }

        const keyBackspace = 8;

        if (e.which === keyBackspace && this.state.activeMessageBody.length === 0) {
            this.props.deleteMessageStream(this.messageId);

            this.messageId = null;

            this.setState({
                activeMessageBody: ''
            });            
        }
    }

	render() {
		return(
            <form className="Chat-messageForm" onSubmit={this.handleSubmit}>
                <input
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    value={this.state.activeMessageBody}
                    placeholder="Type something..."
                    type="text" />
            </form>
		);
	}
}

export default MessageForm;