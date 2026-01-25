import { useState, useEffect } from "react";

import { createChatRoom } from "../../services/ChatService";
import Contact from "./Contact";
import UserLayout from "../layouts/UserLayout";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AllUsers({
  users,
  chatRooms,
  groups,
  setChatRooms,
  onlineUsersId,
  currentUser,
  changeChat,
}) {
  const [selectedChat, setSelectedChat] = useState();
  const [nonContacts, setNonContacts] = useState([]);
  const [contactIds, setContactIds] = useState([]);

  useEffect(() => {
    if (chatRooms && chatRooms.length > 0) {
      const Ids = chatRooms.map((chatRoom) => {
        return chatRoom.members.find((member) => member !== currentUser.uid);
      });
      setContactIds(Ids);
    }
  }, [chatRooms, currentUser.uid]);

  useEffect(() => {
    if (users && users.length > 0) {
      setNonContacts(
        users.filter(
          (f) => f.uid !== currentUser.uid && !contactIds.includes(f.uid)
        )
      );
    }
  }, [contactIds, users, currentUser.uid]);

  const changeCurrentChat = (index, chat) => {
    setSelectedChat(index);
    changeChat(chat);
  };

  const handleNewChatRoom = async (user) => {
    const members = {
      senderId: currentUser.uid,
      receiverId: user.uid,
    };
    const res = await createChatRoom(members);
    setChatRooms((prev) => [...prev, res]);
    changeChat(res);
  };

  // Separate group chats from direct chats
  const directChats = chatRooms?.filter((room) => !room.isGroup) || [];
  const groupChats = chatRooms?.filter((room) => room.isGroup) || [];

  return (
    <>
      <ul className="overflow-auto h-[30rem]">
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white font-semibold">Direct Chats</h2>
        <li>
          {directChats && directChats.length > 0 ? (
            directChats.map((chatRoom, index) => (
              <div
                key={index}
                className={classNames(
                  index === selectedChat
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "transition duration-150 ease-in-out cursor-pointer bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700",
                  "flex items-center px-3 py-2 text-sm "
                )}
                onClick={() => changeCurrentChat(index, chatRoom)}
              >
                <Contact
                  chatRoom={chatRoom}
                  onlineUsersId={onlineUsersId}
                  currentUser={currentUser}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm px-3 py-2">
              No direct chats yet. Start a conversation!
            </p>
          )}
        </li>
        
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white font-semibold mt-4">Groups</h2>
        <li>
          {groupChats && groupChats.length > 0 ? (
            groupChats.map((chatRoom, index) => {
              const group = groups?.find((g) => g._id === chatRoom.groupId);
              return (
                <div
                  key={`group-${index}`}
                  className={classNames(
                    "transition duration-150 ease-in-out cursor-pointer bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700",
                    "flex items-center px-3 py-2 text-sm "
                  )}
                  onClick={() => changeChat(chatRoom)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {group?.name?.charAt(0)?.toUpperCase() || "G"}
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {group?.name || "Group Chat"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {group?.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm px-3 py-2">
              No groups yet. Create one to get started!
            </p>
          )}
        </li>
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">
          Other Users
        </h2>
        <li>
          {nonContacts && nonContacts.length > 0 ? (
            nonContacts.map((nonContact, index) => (
              <div
                key={index}
                className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleNewChatRoom(nonContact)}
              >
                <UserLayout user={nonContact} onlineUsersId={onlineUsersId} />
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm px-3 py-2">
              {users && users.length > 0 ? "Loading users..." : "No other users available"}
            </p>
          )}
        </li>
      </ul>
    </>
  );
}
