import { useState, useEffect } from 'react';

const Table8_Above1Lakh = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    above1Lakh: {
      onDate: 0,
      fromDate: 0,
      year2024: 0
    },
    above10Lakh: {
      onDate: 0,
      fromDate: 0,
      year2024: 0
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 8: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, reset to default values
      console.log('Table 8: No localStorage data, resetting to default values');
      setTableData({
        above1Lakh: {
          onDate: 0,
          fromDate: 0,
          year2024: 0
        },
        above10Lakh: {
          onDate: 0,
          fromDate: 0,
          year2024: 0
        }
      });
    }
  }, [date, data]);

  const handleChange = (category, period, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [category]: {
        ...tableData[category],
        [period]: newValue
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">S.No</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">Category</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">On {date}</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">From 01.01.25 to till Date</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">YEAR - 2024</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-4 py-2">1</td>
            <td className="border border-gray-300 px-4 py-2">Above 1 Lakh</td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.above1Lakh.onDate}
                onChange={(value) => handleChange('above1Lakh', 'onDate', value)}
              />
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.above1Lakh.fromDate}
                onChange={(value) => handleChange('above1Lakh', 'fromDate', value)}
              />
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.above1Lakh.year2024}
                onChange={(value) => handleChange('above1Lakh', 'year2024', value)}
              />
            </td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">2</td>
            <td className="border border-gray-300 px-4 py-2">Above 10 Lakh</td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.above10Lakh.onDate}
                onChange={(value) => handleChange('above10Lakh', 'onDate', value)}
              />
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.above10Lakh.fromDate}
                onChange={(value) => handleChange('above10Lakh', 'fromDate', value)}
              />
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.above10Lakh.year2024}
                onChange={(value) => handleChange('above10Lakh', 'year2024', value)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table8_Above1Lakh; 