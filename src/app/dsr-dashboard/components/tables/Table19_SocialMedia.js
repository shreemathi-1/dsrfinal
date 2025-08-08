import { useState, useEffect } from 'react';

const Table19_SocialMedia = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      facebook: { image: 0, video: 0 },
      twitter: { image: 0, video: 0 },
      instagram: { image: 0, video: 0 }
    },
    fromDate: {
      facebook: { image: 0, video: 0 },
      twitter: { image: 0, video: 0 },
      instagram: { image: 0, video: 0 }
    },
    year2024: {
      facebook: { image: 0, video: 0 },
      twitter: { image: 0, video: 0 },
      instagram: { image: 0, video: 0 }
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 19: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 19: No localStorage data, using default values');
    }
  }, [date, data]);

  const handleChange = (period, platform, type, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [period]: {
        ...tableData[period],
        [platform]: {
          ...tableData[period][platform],
          [type]: newValue
        }
      }
    };
    setTableData(newData);
    if (onDataChange) onDataChange(newData);
  };

  // Render an editable cell
  const EditableCell = ({ value, onChange }) => {
    return editMode ? (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-center border rounded"
      />
    ) : (
      <span>{value}</span>
    );
  };

  const platforms = ['facebook', 'twitter', 'instagram'];
  const types = ['image', 'video'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50">Posts uploaded in Social Media</th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Facebook</th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Twitter</th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Instagram</th>
          </tr>
          <tr>
            {platforms.map(platform => (
              types.map(type => (
                <th key={`${platform}-${type}`} className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </th>
              ))
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">On {date}</td>
            {platforms.map(platform => (
              types.map(type => (
                <td key={`onDate-${platform}-${type}`} className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.onDate[platform][type]}
                    onChange={(value) => handleChange('onDate', platform, type, value)}
                  />
                </td>
              ))
            ))}
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">From 01.01.25 to till Date</td>
            {platforms.map(platform => (
              types.map(type => (
                <td key={`fromDate-${platform}-${type}`} className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.fromDate[platform][type]}
                    onChange={(value) => handleChange('fromDate', platform, type, value)}
                  />
                </td>
              ))
            ))}
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">2024</td>
            {platforms.map(platform => (
              types.map(type => (
                <td key={`2024-${platform}-${type}`} className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.year2024[platform][type]}
                    onChange={(value) => handleChange('year2024', platform, type, value)}
                  />
                </td>
              ))
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table19_SocialMedia; 