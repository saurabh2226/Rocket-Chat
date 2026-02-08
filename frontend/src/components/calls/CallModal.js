import { useState, useRef, useEffect } from "react";
import { PhoneIcon, VideoCameraIcon, XIcon } from "@heroicons/react/solid";

export default function CallModal({
  isOpen,
  onClose,
  callType,
  callerName,
  onAccept,
  onReject,
  localStream,
  remoteStream
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {!localStream && !remoteStream ? (
          // Incoming call
          <div className="text-center">
            <div className="mb-4">
              {callType === "video" ? (
                <VideoCameraIcon className="h-16 w-16 text-blue-600 mx-auto" />
              ) : (
                <PhoneIcon className="h-16 w-16 text-blue-600 mx-auto" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Incoming {callType === "video" ? "Video" : "Audio"} Call
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{callerName}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onReject}
                className="px-6 py-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
              >
                <XIcon className="h-6 w-6" />
              </button>
              <button
                onClick={onAccept}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                {callType === "video" ? (
                  <VideoCameraIcon className="h-6 w-6" />
                ) : (
                  <PhoneIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        ) : (
          // Active call
          <div>
            <div className="relative bg-black rounded-lg mb-4" style={{ height: "400px" }}>
              {remoteStream && (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              {localStream && (
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <PhoneIcon className="h-6 w-6 rotate-135" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
