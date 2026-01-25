import { useState } from "react";
import { 
  CogIcon, 
  UserRemoveIcon, 
  TrashIcon, 
  LogoutIcon,
  BellIcon,
  BellSlashIcon 
} from "@heroicons/react/solid";
import { 
  updateGroup, 
  removeGroupMember, 
  leaveGroup, 
  deleteGroup,
  updateGroupNotifications 
} from "../../services/ChatService";
import { useAuth } from "../../contexts/AuthContext";

export default function GroupManagement({ group, chatRoom, onUpdate, onClose }) {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState(
    group.members?.find(m => m.userId === currentUser.uid)?.notifications !== false
  );
  const isAdmin = group.admin === currentUser.uid;

  const handleUpdateGroup = async () => {
    try {
      setLoading(true);
      setError("");
      await updateGroup(group._id, {
        name: groupName.trim(),
        description: description.trim(),
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await removeGroupMember(group._id, memberId);
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to remove member");
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    
    try {
      await leaveGroup(group._id);
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to leave group");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) return;
    
    try {
      await deleteGroup(group._id);
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete group");
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const newNotifications = !notifications;
      await updateGroupNotifications(group._id, newNotifications);
      setNotifications(newNotifications);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update notifications");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <CogIcon className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      {/* Notification Settings */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {notifications ? (
              <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            ) : (
              <BellSlashIcon className="h-5 w-5 text-gray-400 mr-2" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notifications ? "You'll receive notifications from this group" : "Notifications are muted"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Group Info */}
      <div className="space-y-4 mb-6">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="3"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleUpdateGroup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setGroupName(group.name);
                  setDescription(group.description);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
              {group.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit Group Info
              </button>
            )}
          </>
        )}
      </div>

      {/* Members List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Members ({group.members?.length || 0})
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {group.members?.map((member) => {
            const isCurrentUser = member.userId === currentUser.uid;
            const isMemberAdmin = member.role === "admin";
            return (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="text-gray-900 dark:text-white">
                    {isCurrentUser ? "You" : `User ${member.userId.substring(0, 8)}`}
                    {isMemberAdmin && (
                      <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </span>
                </div>
                {isAdmin && !isCurrentUser && !isMemberAdmin && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove member"
                  >
                    <UserRemoveIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        {isAdmin ? (
          <button
            onClick={handleDeleteGroup}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete Group
          </button>
        ) : (
          <button
            onClick={handleLeaveGroup}
            className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <LogoutIcon className="h-5 w-5 mr-2" />
            Leave Group
          </button>
        )}
      </div>
    </div>
  );
}
