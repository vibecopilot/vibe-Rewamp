const LinearProgressBar = ({ progress }) => {
    return (
      <div className="bg-gray-200 h-1 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };
export default LinearProgressBar  