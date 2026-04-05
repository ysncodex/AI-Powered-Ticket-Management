import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom'; // <--- Import Link

const Header = ({ toggleSidebar }) => {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-1 rounded hover:bg-gray-100">
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-700 hidden sm:block">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
          <Bell size={20} />
        </button>

        {/* Make the User Profile Clickable */}
        <Link
          to="/profile"
          className="flex items-center gap-2 border-l pl-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={18} />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">John Doe</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
