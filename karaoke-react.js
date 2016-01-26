var sanitize = function (str) {
	return str.replace("&", " and ").replace("<", "").replace(">", "");
}

var SongSubmit = React.createClass({
	render: function() {
		var disabled = true;
		if (this.state.personName != "" && this.state.songName != "") {
			disabled = false;
		}
		return (
			<form onSubmit={this.submitSong}>
			<input type="text" placeholder="Your Name" onChange={this.handleNameChange} value={this.state.personName}></input>
			<input type="text" placeholder="Song Title" onChange={this.handleSongNameChange} value={this.state.songName}></input>
			<input type="text" placeholder="Song Artist" onChange={this.handleSongArtistChange} value={this.state.songArtist}></input>
			<button className="songSubmitButton" type="submit" disabled={disabled}>&#x2795; Add to Queue</button>
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
});

var SongItem = React.createClass({
	render: function() {
		var className = "";
		if (this.props.active) {
			className = "active";
		}
		return (
			<tr className={className}><td>{this.props.index+1}</td><td>{this.props.song.person}</td><td>{this.props.song.song.name}</td><td>{this.props.song.song.artist}</td></tr>
		)
	}
});

window.SongQueue = React.createClass({
  	mixins: [ReactFireMixin], 
  	render: function() {
  		if (this.state.songList && this.state.queueStatus) {
  			var songNodes = null;
  			if (this.state.songList.length > 0) {
  				var me = this;
				songNodes = this.state.songList.map(function(song, i) {
		  			return (
		  				<SongItem song={song} active={i == me.state.queueStatus.songNum} index={i}/>
		  			)
	  			}); 
  			}
  			var playerNode = null;
 			if (this.props.player) {
 				playerNode = <window.YoutubePlayer songList={this.state.songList} fb={this.state.fbRef.child('queueStatus')} songNum={this.state.queueStatus.songNum}/>
 			} else {
 				playerNode = <div></div>
 			}

 			var submitNode = null;
 			if (this.state.adding) {
		      	submitNode = <SongSubmit fb={this.state.fbRef.child('songList')}/>
 			} else {
 				submitNode = <button onClick={this.addSong}>&#x2795; New Song</button>
 			}
	  		return (
	  			<div>
	  			<div className="SongQueueHolder">
		      	<table className="SongQueue">
		      	<tbody>
		        	{songNodes}
		        	</tbody>
		      	</table>
		      	{submitNode}
		      	</div>
		      		{playerNode}
		      	</div>
	  		);		
  		} else {
  			return (
  				<h2></h2>
  			)
  		}
  	},

  	addSong: function() {
  		this.setState({adding: true});
  	},

  	componentDidUpdate: function(prevprops, prevstate) {
  		if (this.props.player && (prevstate.queueStatus && this.state.queueStatus && prevstate.queueStatus.songNum != this.state.queueStatus.songNum)) {
  			// http://stackoverflow.com/questions/2905867/how-to-scroll-to-specific-item-using-jquery
  			var container = $(".SongQueue");
  			var scrollTo = $(".SongQueue .active");
  			if (container.offset() && scrollTo.offset()) {
	  			container.animate({
	  				scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
	  			});
  			}
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
		return {songList: null, fbRef: null, queueStatus: {songNum: -1}, bindings: false, adding: false};
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
		if (this.state.tempSessionID == null) {
			var $select = $("#sessions .sessionForm select");
			this.setState({tempSessionID: $select.val(), sessionID: $select.val()});
		} else{
			this.setState({sessionID: this.state.tempSessionID});
		}
	},

	render: function() {
		var me = this;
		var sessionNodes = this.state.sessionList.map(function(newSession) {
			var date = new Date(newSession.date);
			return (
				<option value={newSession.ID}> {newSession.group} {newSession.displayName} {date.toLocaleDateString()}</option> 
			)
		});

		var headingNode = null;
		var buttonText = "CHANGE";
		if (!this.state.sessionID) {
			headingNode = <h2>Select a Session</h2>
			buttonText = "CONFIRM";
		}

		return (
			<div>
			{headingNode}
			<form className="sessionForm">
				<select className="sessionSelect" value={this.state.tempSessionID} onChange={this.sessionChange}>
					{sessionNodes}
				</select>
				<button className="sessionButton" onClick={this.handleSubmit}>{buttonText}</button>
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