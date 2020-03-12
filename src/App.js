import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
const axios = require('axios');


class App extends React.Component {
    constructor(props) {
	super(props);
	this.state = {entries: [], searchString: ''};
	this.updateSearchString = this.updateSearchString.bind(this);
    }

    loadFromServer(searchString) {
	axios.get('http://localhost:8080/api/entries/search/findByNameContaining', {params: {name: searchString}})
	    .then(response => {
		this.setState({
		    entries: response.data._embedded.entries,
		    searchString: searchString
		});
		
	    })
	    .catch(error =>
		   {console.log(error);})
	    .then(function ()
		 {});
    }

    updateSearchString(searchString) {
	if (searchString !== this.state.searchString) {
	    this.loadFromServer(searchString);
	}
    }
    
    componentDidMount() {
	this.loadFromServer(this.state.searchString);
    }

    render() {
	return (
	    <div>
	    <EntryList entries={this.state.entries}
	    searchString={this.state.searchString}
	    updateSearchString={this.updateSearchString}/>
	    </div>
	)
    }
}

class EntryList extends React.Component{

    constructor(props) {
	super(props);
	this.handleInput = this.handleInput.bind(this);
    }
    handleInput(e) {
	e.preventDefault();
	const searchString = ReactDOM.findDOMNode(this.refs.searchString).value;
	this.props.updateSearchString(searchString);
    }
    
    render() {
	const entries = this.props.entries.map(entry =>
	    <Entry key={entry._links.self.href} entry={entry}/>
	);
	return (
	    <div>
	    <input ref="searchString" defaultValue={this.props.searchString} onInput={this.handleInput}/>
	    <table>
	    <tbody>
	    <tr>
	    <th>Name</th>
	    <th>Phone Number</th>
	    </tr>
	    {entries}
	    </tbody>
	    </table>
	    </div>
	)
    }
}

class Entry extends React.Component{
	render() {
		return (
			<tr>
				<td>{this.props.entry.name}</td>
				<td>{this.props.entry.phoneNumber}</td>
			</tr>
		)
	}
}

export default App;
