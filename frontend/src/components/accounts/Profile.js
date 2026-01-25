import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { generateAvatar } from "../../utils/GenerateAvatar";
import { setUsername } from "../../services/ChatService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Profile() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState("");
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState();
  const [loading, setLoading] = useState(false);
  const [userIDError, setUserIDError] = useState("");

  const { currentUser, updateUserProfile, setError } = useAuth();

  useEffect(() => {
    const fetchData = () => {
      const res = generateAvatar();
      setAvatars(res);
    };

    fetchData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (selectedAvatar === undefined) {
      return setError("Please select an avatar");
    }

    if (!username || username.trim() === "") {
      return setError("Please enter a display name");
    }

    if (!userID || userID.trim() === "") {
      return setError("Please enter a unique User ID");
    }

    // Validate User ID format (alphanumeric, 3-20 characters, no spaces)
    const userIDRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!userIDRegex.test(userID)) {
      setUserIDError("User ID must be 3-20 characters, alphanumeric and underscores only");
      return;
    }

    try {
      setError("");
      setUserIDError("");
      setLoading(true);
      
      // Set the unique username/userID
      await setUsername(userID.toLowerCase());
      
      // Update Firebase profile
      const user = currentUser;
      const profile = {
        displayName: username,
        photoURL: avatars[selectedAvatar],
      };
      await updateUserProfile(user, profile);
      navigate("/");
    } catch (e) {
      if (e.response?.data?.error?.includes("already exists") || e.response?.data?.error?.includes("taken")) {
        setUserIDError("This User ID is already taken. Please choose another one.");
      } else {
        setError("Failed to update profile. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-4 text-3xl text-center tracking-tight font-light dark:text-white">
            Pick an avatar
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          <div className="flex flex-wrap -m-1 md:-m-2">
            {avatars.map((avatar, index) => (
              <div key={index} className="flex flex-wrap w-1/3">
                <div className="w-full p-1 md:p-2">
                  <img
                    alt="gallery"
                    className={classNames(
                      index === selectedAvatar
                        ? "border-4  border-blue-700 dark:border-blue-700"
                        : "cursor-pointer hover:border-4 hover:border-blue-700",
                      "block object-cover object-center w-36 h-36 rounded-full"
                    )}
                    src={avatar}
                    onClick={() => setSelectedAvatar(index)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 placeholder-gray-500 bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your display name"
                defaultValue={currentUser.displayName && currentUser.displayName}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="userID" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unique User ID <span className="text-xs text-gray-500">(for searching)</span>
              </label>
              <input
                id="userID"
                name="userID"
                type="text"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 placeholder-gray-500 bg-gray-50 border ${
                  userIDError ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="e.g., john_doe123 (3-20 chars, alphanumeric)"
                onChange={(e) => {
                  setUserID(e.target.value);
                  setUserIDError("");
                }}
              />
              {userIDError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{userIDError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This unique ID will be used by others to find and connect with you
              </p>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
