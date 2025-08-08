import { useState, useEffect } from 'react';

const Table18_CyberVolunteers = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      applied: 0,
      approved: 0,
      rejected: 0,
      pending: 0
    },
    fromDate: {
      applied: 0,
      approved: 0,
      rejected: 0,
      pending: 0
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 18: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 18: No localStorage data, using default values');
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
    { key: 'applied', label: 'Applied' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'pending', label: 'Pending' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th colSpan={columns.length + 1} className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              Progress on Cyber Volunteers Requests
            </th>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50"></th>
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
            <td className="border border-gray-300 px-4 py-2">From 01.01.2020 to till Date</td>
            {columns.map(column => (
              <td key={column.key} className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.fromDate[column.key]}
                  onChange={(value) => handleChange('fromDate', column.key, value)}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table18_CyberVolunteers; 