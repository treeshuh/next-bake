
  var fb = new Firebase("https://next-bake.firebaseio.com/");
      var browserKey = "AIzaSyD3Ivd-nft7gnXM35ldEtI-FO9YS3RYi5I";
      sessionID = "placeholder";
$(document).on('ready', function(){

  $("#search").on('click',function() {
    userText = $("#karaokeUser").val();
    songName = $("#songName").val();
    songArtist = $("#songArtist").val();
    searchText = songName + "+" + songArtist + "+lyrics";

    $.ajax({
      url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + searchText.replace(" ", "+") + "&key=" + browserKey
    }).done(function(data) {
      console.log(data);
      n = data.items.length;
      videoIDs = [];

      for (i = 0; i < n; i ++) {
        item = data.items[i];
        if (item.id.kind=="youtube#video") {
          videoIDs.push(item.id.videoId);
        }
      }
      console.log(videoIDs);
      newQueueItem = fb.child("karaoke").child(sessionID).push();
      newQueueItem.set({
        person: userText,
        song: {
          name: songName,
          artist: songArtist
        },
        videoIDs: videoIDs
      });
    });
  });  

})
fb.child('karaoke').child('activeSessions').on("child_added", function(snapshot){
      option = document.createElement("option");
      console.log(snapshot.val());
      newSession = snapshot.val();
      date = new Date(newSession.date);
      option.text = newSession.group + " " + newSession.ID + " " + date.toLocaleDateString();
      option.value = newSession.ID;
      document.getElementById("sessionList").appendChild(option);
    });

    function changeSession() {
      e = document.getElementById("sessionList");
      val = e.options[e.selectedIndex].value;
      sessionID = val;
      songs = [];
      console.log(sessionID);
      fb.child('karaoke').child(sessionID).on("child_added", function(snapshot) {
        console.log(snapshot.val());
        songs.push(snapshot.val());
        console.log(songs)
      });
    }
