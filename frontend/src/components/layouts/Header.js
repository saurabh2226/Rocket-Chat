import { LogoutIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import Logout from "../accounts/Logout";
import ThemeToggler from "./ThemeToggler";

export default function Header() {
  const [modal, setModal] = useState(false);

  const { currentUser } = useAuth();

  return (
    <>
      <nav className="px-2 sm:px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 border-b border-blue-500 dark:border-gray-700 text-white shadow-lg">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <Link to="/" className="flex items-center group">
            <span className="text-2xl mr-2 group-hover:scale-110 transition-transform duration-200">
              🚀
            </span>
            <span className="self-center text-xl font-bold whitespace-nowrap text-white">
              Rocket Chat
            </span>
          </Link>
          <div className="flex md:order-2">
            <ThemeToggler />

            {currentUser && (
              <>
                <button
                  className="text-white hover:bg-white/20 focus:outline-none rounded-lg text-sm p-2.5 transition-colors duration-200"
                  onClick={() => setModal(true)}
                  title="Logout"
                >
                  <LogoutIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                <Link
                  to="/profile"
                  className="text-white hover:bg-white/20 focus:outline-none rounded-full text-sm p-2.5 transition-all duration-200 hover:ring-2 hover:ring-white/50"
                  title="Profile"
                >
                  <img
                    className="h-9 w-9 rounded-full border-2 border-white/30 hover:border-white/60 transition-all"
                    src={currentUser.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser.uid}`}
                    alt={currentUser.displayName || "Profile"}
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser.uid}`;
                    }}
                  />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {modal && <Logout modal={modal} setModal={setModal} />}
    </>
  );
}
