import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import SplashScreenMessage from './SplashScreenMessage.js';
import SystemMessageType from './SystemMessageType.js';

class Messages extends Component {

	constructor() {
		super();
		
		this.chatWindowContainerRef = React.createRef();
		
		this.autoScrollChatWindow = this.autoScrollChatWindow.bind(this);
    }

	componentDidMount() {
		this.$chatWindowContainer = ReactDOM.findDOMNode(this.chatWindowContainerRef.current);
		this.chatWindowHeight = this.$chatWindowContainer.clientHeight;

		this.autoScrollChatWindow(true);
	}	

	componentDidUpdate() {
		this.autoScrollChatWindow();
	}

	autoScrollChatWindow(forceScroll) {
		if (!forceScroll) {
			const scrollDistanceFromTop = this.$chatWindowContainer.scrollTop;
			const scrollDistanceFromBottom = scrollableHeight - scrollDistanceFromTop - this.chatWindowHeight;
			
			const userHasScrolledUpToLookAtPreviousChats = scrollDistanceFromTop < this.lastScrollDistanceFromTop;
			const userIsAlreadyScrolledAllTheWayDown = scrollDistanceFromBottom === 0;
	
			if (userHasScrolledUpToLookAtPreviousChats || userIsAlreadyScrolledAllTheWayDown) {
				return;
			}
		}

		const scrollableHeight = this.$chatWindowContainer.scrollHeight;

		this.$chatWindowContainer.scrollTo({
			top: scrollableHeight,
			left: 0,
			behavior: 'smooth'
		});

		this.lastScrollDistanceFromTop = this.$chatWindowContainer.scrollTop;
	}

	render() {
		return(
			<div className="Chat-body-messages" ref={this.chatWindowContainerRef}>
				<ul className="Chat-body-messages-list">
					{Array.from(this.props.messages.values()).map((message) => {
						const isSystemMessage = message.hasOwnProperty('systemMessageType');
						const isSystemSplashScreenMessage = isSystemMessage && message.systemMessageType === SystemMessageType.SPLASH_SCREEN;

						const isSystemMessageClassName = isSystemMessage ? 'is-system-message' : '';
						const isActiveMessageClassName = message.isActive ? 'is-active-message' : '';
						const conditionalClassNames = `${isActiveMessageClassName} ${isSystemMessageClassName}`;

						return (
							<li key={message.id} className={`Chat-body-messages-list-item ${conditionalClassNames}`}>
								<div className="Chat-body-messages-list-item-meta">
									<span className="Chat-body-messages-list-item-meta-timestamp">{message.time}</span>
									<span className="Chat-body-messages-list-item-meta-nick">{message.nick}</span>
								</div>
								{isSystemSplashScreenMessage ? (
									<span className="Chat-body-messages-list-item-body"><pre className="Chat-body-messages-list-item-body-splashScreenMessage">{SplashScreenMessage}</pre></span>
								) : (
									<span className="Chat-body-messages-list-item-body">{message.body}</span>
								)}
							</li>
						);
					})}
				</ul>      
			</div>
		);
	}
}

export default Messages;