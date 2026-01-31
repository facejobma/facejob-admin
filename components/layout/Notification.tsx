import React from "react";
import { Bell } from "lucide-react"; 

const Notification: React.FC = () => {
  return (
    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer" />
  );
};

export default Notification;
