import { format } from "timeago.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Message({ message, self, isGroup = false }) {
  const isOwnMessage = self === message.sender;
  
  return (
    <li
      className={classNames(
        isOwnMessage ? "justify-end" : "justify-start",
        "flex mb-2"
      )}
    >
      <div className={classNames(
        isOwnMessage ? "items-end" : "items-start",
        "flex flex-col max-w-[70%]"
      )}>
        {isGroup && !isOwnMessage && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
            {message.senderName || "User"}
          </span>
        )}
        <div
          className={classNames(
            isOwnMessage
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "relative px-4 py-2 rounded-lg shadow-sm"
          )}
        >
          <span className="block font-normal break-words">{message.message}</span>
        </div>
        <span className={classNames(
          "block text-xs mt-1 px-2",
          isOwnMessage ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-500"
        )}>
          {message.createdAt ? format(message.createdAt) : "Just now"}
        </span>
      </div>
    </li>
  );
}
