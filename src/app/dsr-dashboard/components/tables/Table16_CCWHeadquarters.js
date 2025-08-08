import { useState, useEffect } from 'react';

const Table16_CCWHeadquarters = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      complaintsReceived: 0,
      firRegistered: 0,
      csrIssued: 0,
      accusedArrested: 0
    },
    fromDate: {
      complaintsReceived: 0,
      firRegistered: 0,
      csrIssued: 0,
      accusedArrested: 0
    },
    year2024: {
      complaintsReceived: 0,
      firRegistered: 0,
      csrIssued: 0,
      accusedArrested: 0
    },
    year2023: {
      complaintsReceived: 0,
      firRegistered: 0,
      csrIssued: 0,
      accusedArrested: 0
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 16: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 16: No localStorage data, using default values');
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

  const rows = [
    { key: 'complaintsReceived', label: 'No. of Complaints Received' },
    { key: 'firRegistered', label: 'No. of FIRs Registered' },
    { key: 'csrIssued', label: 'No. of CSR Issued' },
    { key: 'accusedArrested', label: 'No.of Accused arrested' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">CCW headquarters</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">On {date}</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">From 01.01.25 to till Date</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">2024</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">2023</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2">{row.label}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.onDate[row.key]}
                  onChange={(value) => handleChange('onDate', row.key, value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.fromDate[row.key]}
                  onChange={(value) => handleChange('fromDate', row.key, value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.year2024[row.key]}
                  onChange={(value) => handleChange('year2024', row.key, value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.year2023[row.key]}
                  onChange={(value) => handleChange('year2023', row.key, value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table16_CCWHeadquarters; 