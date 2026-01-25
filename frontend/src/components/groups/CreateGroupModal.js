import { useState, useEffect } from "react";
import { XIcon, UserAddIcon } from "@heroicons/react/solid";
import { createGroup, getAllUsers } from "../../services/ChatService";
import { useAuth } from "../../contexts/AuthContext";
import UserLayout from "../layouts/UserLayout";

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const users = await getAllUsers();
      // Filter out current user
      const filtered = users.filter((user) => user.uid !== currentUser.uid);
      setAvailableUsers(filtered);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleMemberToggle = (user) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.uid === user.uid);
      if (isSelected) {
        return prev.filter((m) => m.uid !== user.uid);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Please select at least one member");
      return;
    }

    try {
      setLoading(true);
      const memberIds = selectedMembers.map((m) => m.uid);
      const groupData = {
        name: groupName.trim(),
        description: description.trim(),
        members: memberIds,
        isPrivate: false,
      };

      const result = await createGroup(groupData);
      onGroupCreated(result);
      handleClose();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
    setError("");
    onClose();
  };

  const filteredUsers = availableUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    const displayName = user.displayName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const username = user.username?.toLowerCase() || "";
    return displayName.includes(query) || email.includes(query) || username.includes(query);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Create New Group</h3>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What's this group about?"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Members *
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  placeholder="Search users..."
                />

                {selectedMembers.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <span
                        key={member.uid}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        {member.displayName || member.email}
                        <button
                          type="button"
                          onClick={() => handleMemberToggle(member)}
                          className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedMembers.some((m) => m.uid === user.uid);
                    return (
                      <div
                        key={user.uid}
                        onClick={() => handleMemberToggle(user)}
                        className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          isSelected ? "bg-blue-50 dark:bg-blue-900/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <UserLayout user={user} />
                          {isSelected && (
                            <span className="text-blue-600 dark:text-blue-400">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
