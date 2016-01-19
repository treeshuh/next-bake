var sanitize = function (str) {
  return str.replace("&", " and ").replace("<", "").replace(">", "");
}

window.YoutubePlayer = React.createClass({
  render: function() {
    return (<div>
      <button onClick={this.nextSong}>Next Song</button>
      <button onClick={this.nextVidID}>Next ID</button>
      <form onSubmit={this.jumpToSongSubmit}>
        <input type="text" onChange={this.handleJumpChange} placeholder="Jump to..." value={this.state.jumpIndex}></input>
        <button type="submit">JUMP</button>
      </form>
      </div>)
  }, 

  componentDidMount: function() {
    this.makePlayer();
    this.props.fb.update({songNum: -1});
  },

  shouldComponentUpdate: function(nextprops, nextstate) {
    if (nextprops.songNum === 'undefined') {
      return false;
    } 
    return true;
  },

  componentDidUpdate: function(prevprop, prevstate) {
    console.log(prevprop);
    console.log(this.props)
    if (!this._song && this.props.songList.length > 0 && this._playerReady) {
      this.jumpToSong(0);
    }
  },

  makePlayer: function() {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var scaledW = 0.75*w;
    var me = this;
    var newPlayer = new window.YT.Player('player', {
      height: scaledW*9/16,
      width: scaledW,
      videoId: 'M7lc1UVf-VE',
      events: {
        'onReady': me.onPlayerReady,
        'onStateChange': me.onPlayerStateChange
      }
    }); 
    me._player = newPlayer;

    window.onresize = function() {
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      scaledW = 0.75*w;
      me._player.setSize(scaledW, scaledW*9/16);
    }
  }, 

  onPlayerStateChange: function(event) {
    if (event.data == 0) {
      this.nextSong();
    }
  },

  onPlayerReady: function(event) {
    this._playerReady = true;
    if (!this._song && this.props.songList.length > 0) {
      this.jumpToSong(0);
    }
  },

  nextSong: function(event) {
    event.preventDefault();
    this.jumpToSong(this.props.songNum + 1);
  },

  handleJumpChange: function(event) {
    event.preventDefault();
    this.setState({jumpIndex: sanitize(event.target.value)});
  },

  jumpToSongSubmit: function(event) {
    event.preventDefault();
    //offset by one because of 0-indexing
    this.jumpToSong(parseInt(this.state.jumpIndex)-1);
    this.setState({jumpIndex: ''});
  },

  jumpToSong: function(nextNum) {
    if (nextNum < this.props.songList.length) {
      this._song = this.props.songList[nextNum];
      this.props.fb.update({songNum : nextNum});
      this.setState({vidIndex: 0});
      this.updateAndPlayVideo();
    }
  },

  nextVidID: function() {
    var newIndex = this.state.vidIndex + 1;
    if (newIndex < this._song.videoIDs.length) {
      this.setState({vidIndex: newIndex});
    }
    this.updateAndPlayVideo();
  },

  updateAndPlayVideo: function() {
    var vidID = this._song.videoIDs[this.state.vidIndex];
    this._player.loadVideoById(vidID);
  },

  getInitialState: function() {
    return {vidIndex: 0, jumpIndex: ''};
  }
});

window.SessionCreator = React.createClass({
  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" placeholder="New Session Display Name" onChange={this.handleDisplayNameChange} value={this.state.displayName}></input>
        <input type="text" placeholder="New Session Group" onChange={this.handleGroupChange} value={this.state.group}></input>
        <button type="submit">Create</button>
      </form>
    )
  },

  componentDidMount: function() {
    this._fb = new Firebase("https://next-bake.firebaseio.com/karaoke");
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var me = this;
    var newSession = this._fb.child('activeSessions').push();
    var date = Date.now();
    var ID = me.state.displayName+date;
    ID = ID.replace(/\s+/g, '');
    newSession.set({
      date: date,
      ID: ID,
      displayName: me.state.displayName,
      group: this.state.group
    });
    this._fb.child(ID).child('queueStatus').set({songNum: -1});
    this.setState({displayName: '', group: ''});
  },

  handleDisplayNameChange: function(e) {
    this.setState({displayName: sanitize(e.target.value)});
  },

  handleGroupChange: function(e) {
    this.setState({group: sanitize(e.target.value)});
  },

  getInitialState: function() {
    return {displayName: '', group: ''}
  }  
});