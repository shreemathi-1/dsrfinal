import { useState, useEffect } from 'react';

const Table6_TrendingMO = ({ date, editMode, data, onDataChange }) => {
  const [moDescription, setMoDescription] = useState(
    "MO:investment scam - through social media advertisement. Victim see advertisement for stock market trading in social media and invest amount through fake website or apps. Loses money."
  );

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && data.moDescription) {
      // Use data from localStorage (passed via props)
      console.log('Table 6: Using data from localStorage:', data);
      setMoDescription(data.moDescription);
    } else {
      // If no localStorage data, reset to default value
      console.log('Table 6: No localStorage data, resetting to default value');
      setMoDescription(
        "MO:investment scam - through social media advertisement. Victim see advertisement for stock market trading in social media and invest amount through fake website or apps. Loses money."
      );
    }
  }, [date, data]);

  const handleChange = (value) => {
    setMoDescription(value);
    if (onDataChange) onDataChange({ moDescription: value });
  };

  return (
    <div className="overflow-x-auto">
      <div className="border border-gray-300 rounded-lg">
        {editMode ? (
          <textarea
            value={moDescription}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-4 min-h-[100px] border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter MO description..."
          />
        ) : (
          <div className="p-4 whitespace-pre-wrap">{moDescription}</div>
        )}
      </div>
    </div>
  );
};

export default Table6_TrendingMO; 