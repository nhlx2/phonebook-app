import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
const axios = require('axios');


class App extends React.Component {
    constructor(props) {
	super(props);
	this.state = {entries: [], attributes: [], searchString: ''};
	this.updateSearchString = this.updateSearchString.bind(this);
	this.onCreate = this.onCreate.bind(this);
    }

    loadFromServer(searchString) {
	axios.get('http://localhost:8080/api/entries')
	    .then(response => {
		return axios.get(response.data._links.search.href)
			    .then(searchLink => {
				return axios.get(searchLink.data._links.self.href+"/findByNameContaining", {params: {name: searchString}} ) //String concat a little disappointing.
					    .then(matchingEntries => {
						this.matchingEntries = matchingEntries;
						return response;
					    });
			    });
	    })
	     .then(response => {
		 axios.get(response.data._links.profile.href, {headers: {'Accept':'application/schema+json'}})
		      .then(schema => {
			  this.schema = schema.data;
			  this.setState({
			      entries: this.matchingEntries.data._embedded.entries,
			      attributes: Object.keys(this.schema.properties),
			      searchString: searchString
			  });
		      })
	     }) 
	     .catch(error =>
		   {console.log(error);})
	     .then(function ()
		 {});
    }

    onCreate(newEntry) {
	axios.post('http://localhost:8080/api/entries', newEntry)
	    .then(response => {
		this.loadFromServer('');
	    })
	    .catch(error =>
		   {console.log(error);})
	    .then(function () {});
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
	    <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
	    <EntryList entries={this.state.entries}
	    searchString={this.state.searchString}
	    updateSearchString={this.updateSearchString}/>
	    </div>
	)
    }
}

class CreateDialog extends React.Component {

    constructor(props) {
	super(props);
	this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
	e.preventDefault();
	const newEntry = {};
	this.props.attributes.forEach(attribute => {
	    newEntry[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
	});
	this.props.onCreate(newEntry);

	// clear out the dialog's inputs
	this.props.attributes.forEach(attribute => {
	    ReactDOM.findDOMNode(this.refs[attribute]).value = '';
	});

	// Navigate away from the dialog to hide it.
	window.location = "#";
    }

    render() {
	const inputs = this.props.attributes.map(attribute =>
						 <p key={attribute}>
						 <input type="text" placeholder={attribute} ref={attribute} className="field"/>
						 </p>
						);

	return (
		<div>
		<a href="#createEntry">Create</a>

		<div id="createEntry" className="modalDialog">
		<div>
		<a href="#" title="Close" className="close">X</a>

		<h2>Create new entry</h2>

		<form>
		{inputs}
		<button onClick={this.handleSubmit}>Create</button>
		</form>
		</div>
		</div>
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
            <label htmlFor="search">Search:</label>
	    <input ref="searchString" defaultValue={this.props.searchString} onInput={this.handleInput} id="search"/>
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
