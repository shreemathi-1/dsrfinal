import { useState, useEffect } from 'react';

const Table17_Awareness = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      school: 0,
      college: 0,
      publicPlace: 0,
      otherPlaces: 0
    },
    fromDate: {
      school: 0,
      college: 0,
      publicPlace: 0,
      otherPlaces: 0
    },
    year2024: {
      school: 0,
      college: 0,
      publicPlace: 0,
      otherPlaces: 0
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 17: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 17: No localStorage data, using default values');
    }
  }, [date, data]);

  const handleChange = (period, field, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [period]: {
        ...tableData[period],
        [field]: newValue
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

  const columns = [
    { key: 'school', label: 'School' },
    { key: 'college', label: 'College' },
    { key: 'publicPlace', label: 'Public Place' },
    { key: 'otherPlaces', label: 'Other Places' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Awareness Conducted</th>
            {columns.map(column => (
              <th key={column.key} className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">On {date}</td>
            {columns.map(column => (
              <td key={column.key} className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.onDate[column.key]}
                  onChange={(value) => handleChange('onDate', column.key, value)}
                />
              </td>
            ))}
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">From 01.01.25 to till Date</td>
            {columns.map(column => (
              <td key={column.key} className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.fromDate[column.key]}
                  onChange={(value) => handleChange('fromDate', column.key, value)}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">2024</td>
            {columns.map(column => (
              <td key={column.key} className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.year2024[column.key]}
                  onChange={(value) => handleChange('year2024', column.key, value)}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table17_Awareness; 