import React, { Component} from 'react';

class NickDialog extends Component {

    constructor() {
        super();

        this.state = {
            newNick: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);
    }

    handleChange(e) {
        this.setState({
            newNick: e.target.value
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.state.newNick.length === 0) {
            alert('To name is to know. Nickname cannot be blank!');
            return;
        }

        this.props.requestNickUpdate(this.state.newNick);

        this.setState({
            newNick: ''
        });
    }

    handleCloseButtonClick(e) {
        e.preventDefault();
        
        this.props.closeNickDialog();

        this.setState({
            newNick: ''
        });
    }

	render() {
        if (!this.props.socketIdForNickUpdate) {
            return null;
        }

		return(
            <div className="Chat-nickDialog">
                <form onSubmit={this.handleSubmit}>
                    <input 
                        onChange={this.handleChange}
                        value={this.state.newNick}
                        placeholder="New Nickname"
                        type="text" 
                        maxLength="15" />

                    <button type="submit">OK</button>
                    <button onClick={this.handleCloseButtonClick}>Cancel</button>
                </form>            
            </div>
		);
	}
}

export default NickDialog;