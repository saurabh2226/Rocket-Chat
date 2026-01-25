import { useState, useEffect, useRef } from "react";
import { PhoneIcon, VideoCameraIcon, CogIcon } from "@heroicons/react/solid";
import { getMessagesOfChatRoom, sendMessage, getGroup } from "../../services/ChatService";
import { WebRTCManager } from "../../utils/WebRTC";
import CallModal from "../calls/CallModal";
import GroupManagement from "../groups/GroupManagement";

import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [group, setGroup] = useState(null);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [callState, setCallState] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const webrtcRef = useRef(null);

  const scrollRef = useRef();
  const isGroup = currentChat?.isGroup || currentChat?.groupId ? true : false;

  useEffect(() => {
    // Reset messages when chat changes
    setMessages([]);
    setIncomingMessage(null);

    const fetchData = async () => {
      if (currentChat?._id) {
        try {
          const res = await getMessagesOfChatRoom(currentChat._id);
          setMessages(res || []);
        } catch (error) {
          console.error("Error fetching messages:", error);
          setMessages([]);
        }
      }
    };

    fetchData();

    // Fetch group data if it's a group chat
    if (isGroup && currentChat?.groupId) {
      getGroup(currentChat.groupId)
        .then((groupData) => {
          setGroup(groupData);
        })
        .catch((error) => {
          console.error("Error fetching group:", error);
        });
    } else {
      setGroup(null);
    }
  }, [currentChat?._id, isGroup, currentChat?.groupId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const handleMessage = (data) => {
      // Only add message if it's for this chat room
      const isForThisRoom = 
        (isGroup && data.chatRoomId === currentChat?._id) ||
        (!isGroup && (!data.chatRoomId || data.chatRoomId === currentChat?._id));
      
      if (isForThisRoom && data.senderId !== currentUser.uid) {
        setIncomingMessage({
          senderId: data.senderId,
          message: data.message,
          createdAt: new Date(),
          _id: Date.now().toString(), // Temporary ID
        });
      }
    };

    if (socket.current) {
      socket.current.on("getMessage", handleMessage);
    }

    return () => {
      if (socket.current) {
        socket.current.off("getMessage", handleMessage);
      }
    };
  }, [socket, currentChat?._id, isGroup, currentUser.uid]);

  useEffect(() => {
    incomingMessage && setMessages((prev) => [...prev, incomingMessage]);
  }, [incomingMessage]);

  // Initialize WebRTC when socket is ready
  useEffect(() => {
    const initializeWebRTC = () => {
      if (socket.current && socket.current.connected && !webrtcRef.current) {
        try {
          webrtcRef.current = new WebRTCManager(socket.current, currentUser.uid);
          webrtcRef.current.onCallStateChange = (state) => {
            setCallState(state);
            if (state.type === "remote-stream") {
              setRemoteStream(state.stream);
            }
          };
          console.log("WebRTC Manager initialized successfully");
        } catch (error) {
          console.error("Error initializing WebRTC:", error);
        }
      }
    };

    // Try to initialize immediately if socket is ready
    initializeWebRTC();

    // Also listen for socket connection if not ready
    if (socket.current && !socket.current.connected) {
      socket.current.on("connect", initializeWebRTC);
    }

    // Cleanup
    return () => {
      if (socket.current) {
        socket.current.off("connect", initializeWebRTC);
      }
      if (webrtcRef.current) {
        webrtcRef.current.endCall();
      }
    };
  }, [socket, currentUser.uid]);

  const handleFormSubmit = async (message) => {
    if (isGroup) {
      // Group message
      socket.current.emit("sendMessage", {
        senderId: currentUser.uid,
        chatRoomId: currentChat._id,
        message: message,
        isGroup: true,
      });
    } else {
      // Direct message
      const receiverId = currentChat.members.find(
        (member) => member !== currentUser.uid
      );

      socket.current.emit("sendMessage", {
        senderId: currentUser.uid,
        receiverId: receiverId,
        message: message,
      });
    }

    const messageBody = {
      chatRoomId: currentChat._id,
      sender: currentUser.uid,
      message: message,
      isGroupMessage: isGroup,
    };
    const res = await sendMessage(messageBody);
    setMessages([...messages, res]);
  };

  const handleStartCall = async (callType) => {
    if (isGroup) {
      alert("Group calls coming soon!");
      return;
    }

    // Initialize WebRTC if not already initialized
    if (!webrtcRef.current) {
      if (socket.current && socket.current.connected) {
        try {
          webrtcRef.current = new WebRTCManager(socket.current, currentUser.uid);
          webrtcRef.current.onCallStateChange = (state) => {
            setCallState(state);
            if (state.type === "remote-stream") {
              setRemoteStream(state.stream);
            }
          };
          console.log("WebRTC Manager initialized successfully");
        } catch (error) {
          console.error("Error initializing WebRTC:", error);
          alert("Failed to initialize call service. Please refresh the page.");
          return;
        }
      } else {
        alert("Connection not ready. Please wait a moment and try again.");
        return;
      }
    }

    try {
      const receiverId = currentChat.members.find(
        (member) => member !== currentUser.uid
      );
      if (!receiverId) {
        alert("Cannot find receiver");
        return;
      }
      const stream = await webrtcRef.current.initializeCall(receiverId, callType);
      setLocalStream(stream);
      setCallState({ type: "outgoing", callType });
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Failed to start call. Please check your permissions and ensure microphone/camera access is granted.");
    }
  };

  const handleAcceptCall = async () => {
    // Initialize WebRTC if not already initialized
    if (!webrtcRef.current) {
      if (socket.current && socket.current.connected) {
        try {
          webrtcRef.current = new WebRTCManager(socket.current, currentUser.uid);
          webrtcRef.current.onCallStateChange = (state) => {
            setCallState(state);
            if (state.type === "remote-stream") {
              setRemoteStream(state.stream);
            }
          };
        } catch (error) {
          console.error("Error initializing WebRTC:", error);
          alert("Failed to initialize call service.");
          return;
        }
      } else {
        alert("Connection not ready. Please wait a moment and try again.");
        return;
      }
    }

    if (!callState.offer) {
      alert("Call data not available");
      return;
    }

    try {
      const stream = await webrtcRef.current.acceptCall(
        callState.callerId,
        {
          offer: callState.offer,
          callType: callState.callType,
        }
      );
      setLocalStream(stream);
      setCallState({ ...callState, type: "active" });
    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Failed to accept call. Please check your permissions.");
    }
  };

  const handleRejectCall = () => {
    if (webrtcRef.current && callState?.callerId) {
      webrtcRef.current.rejectCall(callState.callerId);
    }
    setCallState(null);
  };

  const handleEndCall = () => {
    if (webrtcRef.current) {
      webrtcRef.current.endCall();
    }
    setCallState(null);
    setLocalStream(null);
    setRemoteStream(null);
  };

  if (!currentChat) {
    return (
      <div className="lg:col-span-2 lg:block">
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center flex-1">
            {isGroup ? (
              group ? (
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold mr-3">
                    {group.name?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{group.name}</h3>
                    <p className="text-white/80 text-xs">{group.members?.length || 0} members</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold mr-3">
                    G
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Loading group...</h3>
                  </div>
                </div>
              )
            ) : (
              <Contact chatRoom={currentChat} currentUser={currentUser} />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!isGroup && (
              <>
                <button
                  onClick={() => handleStartCall("audio")}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  title="Audio Call"
                >
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleStartCall("video")}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  title="Video Call"
                >
                  <VideoCameraIcon className="h-5 w-5" />
                </button>
              </>
            )}
            {isGroup && (
              <button
                onClick={() => setShowGroupManagement(true)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Group Settings"
              >
                <CogIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          {messages && messages.length > 0 ? (
            <ul className="space-y-2">
              {messages.map((message, index) => (
                <div key={message._id || index} ref={index === messages.length - 1 ? scrollRef : null}>
                  <Message message={message} self={currentUser.uid} isGroup={isGroup} />
                </div>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        <ChatForm handleFormSubmit={handleFormSubmit} />
      </div>

      {/* Call Modal */}
      {callState && (
        <CallModal
          isOpen={true}
          onClose={handleEndCall}
          callType={callState.callType || "video"}
          callerName={callState.callerName || "User"}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          localStream={localStream}
          remoteStream={remoteStream}
        />
      )}

      {/* Group Management Modal */}
      {showGroupManagement && group && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <GroupManagement
            group={group}
            chatRoom={currentChat}
            onUpdate={() => {
              getGroup(currentChat.groupId).then(setGroup);
            }}
            onClose={() => setShowGroupManagement(false)}
          />
        </div>
      )}
    </div>
  );
}
