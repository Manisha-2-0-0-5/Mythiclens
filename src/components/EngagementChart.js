import React from "react";

function EngagementChart({ uploadHistory, standalone = false }) {
  return (
    <div className="mt-6 bg-white bg-opacity-95 p-6 rounded-2xl shadow-lg w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        {standalone ? "User Engagement" : "Your Upload History"}
      </h2>

      {uploadHistory.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {uploadHistory.map((item, index) => (
            <li
              key={index}
              className="py-3 flex justify-between items-center text-gray-700"
            >
              <span className="font-medium">{item.objectName}</span>
              <span className="text-sm text-gray-500">
                {new Date(item.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-center italic">
          No uploads yet. Start exploring!
        </p>
      )}

      {!standalone && uploadHistory.length > 0 && (
        <p className="text-gray-600 text-center mt-4">
          📦 Total Uploads: <span className="font-semibold">{uploadHistory.length}</span>
        </p>
      )}
    </div>
  );
}

export default EngagementChart;
