// 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    var browserKey = "AIzaSyD3Ivd-nft7gnXM35ldEtI-FO9YS3RYi5I";
    var fb = new Firebase("https://next-bake.firebaseio.com/");
    var songs = [];
    var currentSongNum = 0;
    var currentSong = null;
    var me = this;
    fb.child('karaoke').child('session1').on("child_added", function(snapshot) {
      console.log(snapshot.val());
      songs.push(snapshot.val());
      console.log(songs)
    });

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    var player;
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'M7lc1UVf-VE',
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      currentSong = songs[currentSongNum];
      vidID = currentSong.videoIDs[0];
      player.loadVideoById(vidID);
      event.target.playVideo();
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    var done = false;
    function onPlayerStateChange(event) {
      if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
      }
      if (event.data == 0) {
        console.log("donezo");
      }
    }
    function stopVideo() {
      player.stopVideo();
    }
$(document).on('ready', function(){

  $("#search").on('click',function() {
    userText = $("#karaokeUser").val();
    songName = $("#songName").val();
    songArtist = $("#songArtist").val();
    searchText = songName + "+" + songArtist + "+lyrics";
    console.log(searchText);

    $.ajax({
      url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + searchText.replace(" ", "+") + "&key=" + browserKey
    }).done(function(data) {
      console.log(data);
      n = data.items.length;
      videoIDs = [];

      for (i = 0; i < n; i ++) {
        item = data.items[i];
        /*if (item.id.kind == "youtube#video") {
          $("#searchResults").append("<div>" +
            "<img src="+item.snippet.thumbnails.default.url+"/>" +
            "<label>Title</label>" + item.snippet.title +
            "<label>Channel</label>" + item.snippet.channelTitle + 
            "<label>Date</label>" + new Date(item.snippet.publishedAt)+
            "</div>");
        }*/
        if (item.id.kind=="youtube#video") {
          videoIDs.push(item.id.videoId);
        }
      }
      console.log(videoIDs);
      newQueueItem = fb.child("karaoke").child("session1").push();
      newQueueItem.set({
        person: userText,
        song: {
          name: songName,
          artist: songArtist
        },
        videoIDs: videoIDs
      });
    })
  })
})