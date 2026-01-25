import { useState, useEffect, useRef } from "react";
import { SearchIcon, PlusIcon } from "@heroicons/react/solid";
import { createChatRoom } from "../../services/ChatService";
import UserLayout from "../layouts/UserLayout";

export default function Welcome({ users, currentUser, onlineUsersId, setChatRooms, changeChat }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
      setShowSearchResults(false);
      return;
    }

    if (!users || users.length === 0) {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter((user) => {
      if (user.uid === currentUser?.uid) return false;
      
      const query = searchQuery.toLowerCase();
      const displayName = user.displayName?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const username = user.username?.toLowerCase() || "";
      
      // Search by display name, email, and unique username
      return displayName.includes(query) || email.includes(query) || username.includes(query);
    });

    setFilteredUsers(filtered);
    setShowSearchResults(true);
  }, [searchQuery, users, currentUser]);

  const handleStartChat = async (user) => {
    try {
      const members = {
        senderId: currentUser.uid,
        receiverId: user.uid,
      };
      const res = await createChatRoom(members);
      setChatRooms((prev) => [...prev, res]);
      changeChat(res);
      setSearchQuery("");
      setShowSearchResults(false);
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  return (
    <div className="lg:col-span-2 lg:block bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center justify-center h-full px-6 py-12 min-h-[600px]">
        {/* Enhanced Welcome Section with Rocket Icon */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="relative">
            {/* Rocket Icon */}
            <div className="text-8xl mb-4 animate-bounce">
              🚀
            </div>
            {/* Decorative Circles */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>

        {/* Welcome Text with Gradient */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Rocket Chat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Connect with your team and friends instantly
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Search for users by name, email, or User ID to start chatting
          </p>
        </div>

        {/* Enhanced Search Section */}
        <div className="w-full max-w-lg relative">
          <div className="relative shadow-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon
                className="h-6 w-6 text-blue-500 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-14 pr-4 py-4 border-2 border-blue-200 dark:border-blue-700 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-base shadow-lg transition-all duration-200"
              placeholder="Search by name, email, or User ID..."
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Enhanced Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute z-10 mt-3 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-blue-100 dark:border-blue-800 max-h-96 overflow-auto backdrop-blur-sm">
              {filteredUsers.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'user found' : 'users found'}
                    </p>
                  </div>
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user.uid || index}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                      onClick={() => handleStartChat(user)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <UserLayout user={user} onlineUsersId={onlineUsersId} showEmail={true} />
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartChat(user);
                          }}
                        >
                          <PlusIcon className="h-4 w-4 mr-1.5" />
                          Start Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No users found matching
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                    "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Quick Start Button */}
        {!showSearchResults && (
          <div className="mt-8 space-y-4">
            <button
              onClick={() => {
                searchInputRef.current?.focus();
              }}
              className="flex items-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <SearchIcon className="h-5 w-5 mr-2" />
              Search & Start New Chat
            </button>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Real-time Chat</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Instant messaging with your contacts</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Find Users</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Search by name, email, or User ID</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Fast & Secure</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Powered by modern technology</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
