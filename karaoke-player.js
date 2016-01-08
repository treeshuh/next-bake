// 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    var browserKey = "AIzaSyD3Ivd-nft7gnXM35ldEtI-FO9YS3RYi5I";
    var fb = new Firebase("https://next-bake.firebaseio.com/");
    var songs = [];
    var sessionID = "placeholder";
    var currentSongNum = 0;
    var currentSong = null;
    var currentIndex = 0;
    var me = this;
    fb.child('karaoke').child('activeSessions').on("child_added", function(snapshot){
      option = document.createElement("option");
      console.log(snapshot.val());
      addedSession = snapshot.val();
      date = new Date(addedSession.date);
      option.text = addedSession.group + " " + addedSession.ID + " " + date.toLocaleDateString();
      option.val = addedSession.ID;
      document.getElementById("sessionList").appendChild(option);
    });

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    var player;
    function onYouTubeIframeAPIReady() {
      //http://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      player = new YT.Player('player', {
        height: 0.8*h,
        width: 0.8*w,
        videoId: 'M7lc1UVf-VE',
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      window.alert("I'm ready!");
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    var done = false;
    function onPlayerStateChange(event) {
      if (event.data == 0) {
        console.log("donezo");
        nextSong();
      }
    }

    function stopVideo() {
      player.stopVideo();
    }

    window.onresize = function() {
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      player.setSize(w, h);
    }

    function nextSong() {
      currentSongNum += 1;
      currentIndex = 0;
        if (currentSongNum < songs.length) {
          playVid();
        } else {
          console.log("end of playlist!");
        }
    }

    function nextVidID() {
      currentIndex += 1;
      if (currentIndex < currentSong.videoIDs.length) {
        playVid();     
      } else {
        console.log("out of vidID options!");
      }
    }

    function jumpToQueue(num) {
      currentSongNum = num;
      currentIndex = 0;
      playVid();
    }

    function playVid() {
      currentSong = songs[currentSongNum];
      vidID = currentSong.videoIDs[currentIndex];
      player.loadVideoById(vidID);
      player.playVideo();   
    }