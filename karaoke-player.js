// load YT API asynchronously
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
window.onYouTubeIframeAPIReady = function() {
  ReactDOM.render(<window.SongQueue player={true} />, document.getElementById("songQ"));
}

ReactDOM.render(
  <window.SessionSelect />, 
  document.getElementById('sessions')
);

ReactDOM.render(
  <window.SessionCreator />, 
  document.getElementById("sessionCreator")
);