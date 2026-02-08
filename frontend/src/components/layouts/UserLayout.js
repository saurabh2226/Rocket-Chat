export default function UserLayout({ user, onlineUsersId, showEmail = false }) {
  const isOnline = onlineUsersId?.includes(user?.uid);

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={user?.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.uid || 'default'}`}
          alt={user?.displayName || 'User'}
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.uid || 'default'}`;
          }}
        />
        {isOnline ? (
          <span className="absolute bottom-0 left-7 w-3.5 h-3.5 bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
        ) : (
          <span className="absolute bottom-0 left-7 w-3.5 h-3.5 bg-gray-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
        )}
      </div>
      <div className="ml-3 flex flex-col min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
          {user?.displayName || 'Unknown User'}
        </span>
        {user?.username && (
          <span className="block text-xs text-blue-600 dark:text-blue-400 font-mono">
            @{user.username}
          </span>
        )}
        {showEmail && user?.email && (
          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </span>
        )}
        {!showEmail && !user?.username && (
          <span className="block text-xs text-gray-400 dark:text-gray-500">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </div>
    </div>
  );
}
