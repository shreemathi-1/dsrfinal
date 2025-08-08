import { useState, useEffect } from 'react';

const Table15_CIAR = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    receivedFromOthers: {
      onDate: {
        received: 0,
        pending: 0,
        underProcess: 0,
        completed: 0
      },
      tillDate: {
        received: 0,
        pending: 0,
        underProcess: 0,
        completed: 0
      }
    },
    sentToOthers: {
      onDate: {
        received: 0,
        pending: 0,
        underProcess: 0,
        completed: 0
      },
      tillDate: {
        received: 0,
        pending: 0,
        underProcess: 0,
        completed: 0
      }
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 15: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 15: No localStorage data, using default values');
    }
  }, [date, data]);

  const handleChange = (direction, period, field, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [direction]: {
        ...tableData[direction],
        [period]: {
          ...tableData[direction][period],
          [field]: newValue
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

  const rows = [
    { key: 'received', label: 'Request received/Sent' },
    { key: 'pending', label: 'Pending' },
    { key: 'underProcess', label: 'Under process' },
    { key: 'completed', label: 'Request completed' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50">CIAR</th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              Received by Tamil Nadu from other states
            </th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              Sent by Tamil Nadu to other states
            </th>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              on {date}
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              till {date}
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              on {date}
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              till {date}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2">{row.label}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.receivedFromOthers.onDate[row.key]}
                  onChange={(value) => handleChange('receivedFromOthers', 'onDate', row.key, value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.receivedFromOthers.tillDate[row.key]}
                  onChange={(value) => handleChange('receivedFromOthers', 'tillDate', row.key, value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.sentToOthers.onDate[row.key]}
                  onChange={(value) => handleChange('sentToOthers', 'onDate', row.key, value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.sentToOthers.tillDate[row.key]}
                  onChange={(value) => handleChange('sentToOthers', 'tillDate', row.key, value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table15_CIAR; 