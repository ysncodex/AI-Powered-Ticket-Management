import React from 'react';
import { Camera, MapPin, Briefcase, Calendar } from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-6">
      {/* Cover Image & Avatar */}
      <div className="relative h-48 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute -bottom-12 left-8 rounded-full border-4 border-white bg-white p-1">
          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
            JD
          </div>
          <button className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700">
            <Camera size={16} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {/* Left Column: Personal Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">John Doe</h2>
            <p className="text-gray-500">Full Stack Developer</p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={20} />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase size={20} />
                <span>Tech Solutions Inc.</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={20} />
                <span>Joined March 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity / Bio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">About Me</h3>
            <p className="text-gray-600 leading-relaxed">
              Passionate developer with 5+ years of experience in building scalable web
              applications. Love working with React, Node.js, and modern UI libraries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
