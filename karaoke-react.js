var sanitize = function (str) {
	return str.replace("&", " and ").replace("<", "").replace(">", "");
}

var SongSubmit = React.createClass({
	render: function() {
		return (
			<form onSubmit={this.submitSong}>
			<input type="text" placeholder="Your Name" onChange={this.handleNameChange} value={this.state.personName}></input>
			<input type="text" placeholder="Song Title" onChange={this.handleSongNameChange} value={this.state.songName}></input>
			<input type="text" placeholder="Song Artist" onChange={this.handleSongArtistChange} value={this.state.songArtist}></input>
			<button type="submit">GO!</button>
			</form>
		)
	},

	submitSong: function(e) {
		e.preventDefault();
		var me = this;
		var browserKey = "AIzaSyD3Ivd-nft7gnXM35ldEtI-FO9YS3RYi5I";
	    var searchText = this.state.songName + "+" + this.state.songArtist + "+lyrics";
	    $.ajax({
	      url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + searchText.replace(" ", "+") + "&key=" + browserKey,
	      dataType: "jsonp"
	    }).done(function(data) {
	      var n = data.items.length;
	      var videoIDs = [];

	      for (var i = 0; i < n; i ++) {
	        var item = data.items[i];
	        if (item.id.kind=="youtube#video") {
	          videoIDs.push(item.id.videoId);
	        }
	      }
	      
	      var newQueueItem = me.props.fb.push();
	      newQueueItem.set({
	        person: me.state.personName,
	        song: {
	          name: me.state.songName,
	          artist: me.state.songArtist
	        },
	        videoIDs: videoIDs
	      });

	      me.setState({personName: "", songName: "", songArtist: ""});
	    });
	}, 

	handleNameChange: function(e) {
		this.setState({personName: sanitize(e.target.value)});
	},

	handleSongNameChange: function(e) {
		this.setState({songName: sanitize(e.target.value)});
	},

	handleSongArtistChange: function(e) {
		this.setState({songArtist: sanitize(e.target.value)});
	},

	getInitialState: function() {
		return {personName: "", songName: "", songArtist: ""};
	}
})

window.SongQueue = React.createClass({
  	mixins: [ReactFireMixin], 
  	render: function() {
  		if (this.state.songList) {
  			var songNodes = null;
  			if (this.state.songList.length > 0) {
				songNodes = this.state.songList.map(function(song) {
		  			return (
		  				<li>{song.person} | {song.song.name} | {song.song.artist}</li>
		  			)
	  			}); 
  			} else {
  				songNodes = <h2> &lt; no songs to load &gt; </h2>
  			} 
  			var playerNode = null;
 			if (this.props.player) {
 				console.log(this.state.queueStatus.songNum)
 				playerNode = <window.YoutubePlayer songList={this.state.songList} fb={this.state.fbRef.child('queueStatus')} songNum={this.state.queueStatus.songNum}/>
 			} else {
 				playerNode = <div></div>
 			}
	  		return (
	  			<div>
	  			<div>
		      	<ol className="SongQueue">
		        	{songNodes}
		      	</ol>
		      	<SongSubmit fb={this.state.fbRef.child('songList')}/>
		      	</div>
		      		{playerNode}
		      	</div>
	  		);		
  		} else {
  			return (
  				<h2> Select a Session </h2>
  			)
  		}
  		
  	},

	componentWillMount: function() {
		var $button = $("#sessions .sessionForm button");
		var me = this;
		$button.on('click', me.updateFB);
	},

	updateFB: function() {
		var $select = $("#sessions .sessionForm select");
		var fb = new Firebase("https://next-bake.firebaseio.com/karaoke/" + $select.val());
		var me = this;
		me.setState({fbRef: fb});

		if (me.state.bindings) {
			me.unbind("queueStatus");
			me.unbind("songList");
		}
		me.bindAsArray(me.state.fbRef.child('songList'), "songList");
		me.bindAsObject(me.state.fbRef.child('queueStatus'), "queueStatus");
		me.setState({bindings: true});
	},

	componentWillDismount: function() {
		var $button = $("#sessions .sessionForm button");
		var me = this;
		$button.off('click', me.updateFB);
	},

	getInitialState: function() {
		return {songList: null, fbRef: null, queueStatus: {songNum: -1}, bindings: false};
	}
});

window.SessionSelect = React.createClass({
	mixins: [ReactFireMixin],
	sessionChange: function(e) {
		if (e.target.value == "-") {
			return;
		}
		this.setState({tempSessionID: e.target.value});
	},

	handleSubmit: function(e) {
		e.preventDefault();
		this.setState({sessionID: this.state.tempSessionID});
	},

	render: function() {
		var me = this;
		var sessionNodes = this.state.sessionList.map(function(newSession) {
			var date = new Date(newSession.date);
			return (
				<option value={newSession.ID}> {newSession.group} {newSession.ID} {date.toLocaleDateString()}</option> 
			)
		})
		return (
			<div>
			<form className="sessionForm">
				<select className="sessionSelect" value={this.state.tempSessionID} onChange={this.sessionChange}>
					{sessionNodes}
				</select>
				<button className="sessionButton" onClick={this.handleSubmit}>CONFIRM</button>
			</form>
			</div>
		)
	},

	componentWillMount: function() {
  		var fb = new Firebase("https://next-bake.firebaseio.com/karaoke/activeSessions");
  		this.bindAsArray(fb, "sessionList");
	},

	getInitialState: function() {
		return {sessionList: [], tempSessionID: null, sessionID: null};
	}
});