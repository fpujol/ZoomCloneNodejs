const socket = io(
  "https://cesc-zoom-clone.herokuapp.com/6537ca9b-e1ad-4934-bd9e-b3da036663eb"
); //Change to / for development
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const myPeer = new Peer(undefined, {
  path:
    "https://cesc-zoom-clone.herokuapp.com/6537ca9b-e1ad-4934-bd9e-b3da036663eb/peerjs",
  host:
    "https://cesc-zoom-clone.herokuapp.com/6537ca9b-e1ad-4934-bd9e-b3da036663eb", //Change to / for development
  port: "3030",
});
const peers = {};

let myVideoStream;
myVideo.muted = true;

//Triggers permission to request media
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    //On a resolved promise we receive a stream from the browser media

    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    //On a received call answer the call with our stream
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (remoteUserVideoStream) => {
        //Add video when we receive the remote stream
        addVideoStream(video, remoteUserVideoStream);
      });
    });

    //Listen for....
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    // get input value for message
    let text = $("input");

    // when press enter send message
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });

    //Listen for...
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
    });
  })
  .catch((error) => {
    console.error("Error accessing media devices.", error);
  });

//Listen for...
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

//unique id in fact is userId
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

//When a user is connected we call him.
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

//Assign stream on video tag and add video tag
//to a html wrapper
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video); //add video to the html tag
}

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
