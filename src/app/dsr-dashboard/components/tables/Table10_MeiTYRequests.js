import { useState, useEffect } from 'react';

const Table10_MeiTYRequests = ({ date, editMode, data, onDataChange }) => {
  const [status, setStatus] = useState("Nil");

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && data.status) {
      // Use data from localStorage (passed via props)
      console.log('Table 10: Using data from localStorage:', data);
      setStatus(data.status);
    } else {
      // If no localStorage data, keep default value
      console.log('Table 10: No localStorage data, using default value');
    }
  }, [date, data]);

  const handleChange = (value) => {
    setStatus(value);
    if (onDataChange) onDataChange({ status: value });
  };

  return (
    <div className="overflow-x-auto">
      <div className="border border-gray-300 rounded-lg p-4">
        {editMode ? (
          <input
            type="text"
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter status (e.g., Nil)"
          />
        ) : (
          <div className="text-gray-700">{status}</div>
        )}
      </div>
    </div>
  );
};

export default Table10_MeiTYRequests; 