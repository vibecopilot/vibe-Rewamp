import React from "react";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "....loading" }) => {
  return (
    <div className="loading flex items-center justify-center p-4">
      <div className="text-gray-600">{message}</div>
    </div>
  );
};

export default Loading;
