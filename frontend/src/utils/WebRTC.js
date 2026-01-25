// WebRTC utility functions for audio/video calls

export class WebRTCManager {
  constructor(socket, currentUserId) {
    this.socket = socket;
    this.currentUserId = currentUserId;
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.isCallActive = false;
    this.callType = null; // 'audio' or 'video'
    this.onCallStateChange = null;

    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Listen for incoming call
    this.socket.on("incoming-call", (data) => {
      if (this.onCallStateChange) {
        this.onCallStateChange({
          type: "incoming",
          callerId: data.callerId,
          callerName: data.callerName || "User",
          callType: data.callType || "video",
          offer: data.offer, // Store the offer for accepting the call
        });
      }
    });

    // Listen for call accepted
    this.socket.on("call-accepted", async (data) => {
      await this.handleCallAccepted(data);
    });

    // Listen for call rejected
    this.socket.on("call-rejected", () => {
      this.endCall();
      if (this.onCallStateChange) {
        this.onCallStateChange({ type: "rejected" });
      }
    });

    // Listen for ICE candidates
    this.socket.on("ice-candidate", async (data) => {
      if (this.peerConnection && data.candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // Listen for offer (when receiving a call)
    this.socket.on("offer", async (data) => {
      await this.handleOffer(data);
    });

    // Listen for answer (when call is accepted)
    this.socket.on("answer", async (data) => {
      await this.handleAnswer(data);
    });

    // Listen for call ended
    this.socket.on("call-ended", () => {
      this.endCall();
      if (this.onCallStateChange) {
        this.onCallStateChange({ type: "ended" });
      }
    });
  }

  async initializeCall(receiverId, callType = "video") {
    try {
      this.callType = callType;
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });

      this.peerConnection = this.createPeerConnection();
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer via socket
      this.socket.emit("call-user", {
        receiverId,
        offer,
        callType,
        callerName: "User", // You can pass actual user name here
      });

      this.isCallActive = true;
      return this.localStream;
    } catch (error) {
      console.error("Error initializing call:", error);
      throw error;
    }
  }

  async acceptCall(callerId, offerData) {
    try {
      // offerData can be the offer object directly or contain offer and callType
      const offer = offerData.offer || offerData;
      this.callType = offerData.callType || "video";
      
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: this.callType === "video",
        audio: true,
      });

      this.peerConnection = this.createPeerConnection();
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit("accept-call", {
        callerId,
        answer,
      });

      this.isCallActive = true;
      return this.localStream;
    } catch (error) {
      console.error("Error accepting call:", error);
      throw error;
    }
  }

  rejectCall(callerId) {
    this.socket.emit("reject-call", { callerId });
  }

  createPeerConnection() {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onCallStateChange) {
        this.onCallStateChange({
          type: "remote-stream",
          stream: this.remoteStream,
        });
      }
    };

    return pc;
  }

  async handleOffer(data) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit("answer", {
        answer,
        to: data.from,
      });
    }
  }

  async handleAnswer(data) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }

  async handleCallAccepted(data) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.isCallActive = false;
    this.socket.emit("end-call");
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }
}
