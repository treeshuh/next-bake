
  var fb = new Firebase("https://next-bake.firebaseio.com/");
      var browserKey = "AIzaSyD3Ivd-nft7gnXM35ldEtI-FO9YS3RYi5I";
      sessionID = "mixer";
$(document).on('ready', function(){

  $("#search").on('click',function() {
    console.log("searching");
    userText = $("#karaokeUser").val();
    songName = $("#songName").val();
    songArtist = $("#songArtist").val();
    searchText = songName + "+" + songArtist + "+lyrics";
    $.ajax({
      url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + searchText.replace(" ", "+") + "&key=" + browserKey,
      dataType: "jsonp"
    }).done(function(data) {
      console.log("done");
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

