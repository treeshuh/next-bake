var SongQueue = React.createClass({
  	mixins: [ReactFireMixin], 
  	render: function() {
  		console.log("rerendering");
  		console.log(this.state.songList);
    	return (
      	<div className="SongQueue">
        	Hello, world! I am a Song Queue.
      	</div>
    	);
  	},

	componentWillMount: function() {
		var $component = $("#sessionChange");
		var me = this;
		$component.on('click', function() {
			console.log("change");
			var fb = new Firebase("https://next-bake.firebaseio.com/karaoke/" + sessionID);
			if (me.state.songList) {
				me.unbind("songList");
			}
			me.bindAsArray(fb, "songList");
		});
		/*  		console.log("songs are");
		  		console.log(e.target.value);
		  		console.log(this.state.songList);*/
	},

	getInitialState: function() {
		return {songList: null};
	}
});

/*var SessionSelect = React.createClass({
	mixins: [ReactFireMixin],
	sessionChange: function(e) {
		if (e.target.value == "-") {
			return;
		}
		this.setState({sessionID: e.target.value});
	},

	render: function() {
		var me = this;
		var sessionNodes = this.state.sessionList.map(function(newSession) {
			date = new Date(newSession.date);
			return (
				<option value={newSession.ID}> {newSession.group} {newSession.ID} {date.toLocaleDateString()}</option> 
			)
		})
		return (
			<div>
			<h2> hiii </h2>
			<form>
				<select className = "sessionSelect" value={this.state.sessionID} onChange={this.sessionChange}>
					{sessionNodes}
				</select>
			</form>
			<SongQueue />
			</div>
		)
	},

	componentWillMount: function() {
  		var fb = new Firebase("https://next-bake.firebaseio.com/karaoke/activeSessions");
  		this.bindAsArray(fb, "sessionList");
	},

	getInitialState: function() {
		return {sessionList: [], sessionID: "placeholder"};
	}
});

ReactDOM.render(
	<SessionSelect />, 
	document.getElementById('sessions')
);
*/


/*  componentWillMount: function() {
  },

  getInitialState: function() {
  	return {};
  }*/

ReactDOM.render(
  <SongQueue />,
  document.getElementById('songQ')
);