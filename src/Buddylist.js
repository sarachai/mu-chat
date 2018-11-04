import React, { Component} from 'react';

class Buddylist extends Component {
	
	constructor() {
		super();

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(socketId) {
		if (this.props.mySocketId !== socketId) {
			return; // to do: add event listener conditionally instead
		}

		this.props.openNickDialog(socketId);
	}

	render() {
		return(
			<ul className="Chat-buddylist">
				{Array.from(this.props.buddylist.values()).map((buddy) => {

					const isAwayClassName = buddy.isAway ? 'is-away' : '';
					const isMeClassName = this.props.mySocketId === buddy.socketId ? 'is-me' : '';
					const conditionalClassNames = `${isAwayClassName} ${isMeClassName}`;

					return (
						<li 
							key={buddy.nick} 
							className={`Chat-buddylist-item ${conditionalClassNames}`} 
							onClick={this.handleClick.bind(this, buddy.socketId)}>
							<span className="Chat-buddylist-item-nick">{buddy.nick}</span>
						</li>
					)
				})}
			</ul>
		);
	}
}

export default Buddylist;