import { useState, useEffect } from 'react';

const Table9_Above50Lakh = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    above50Lakh: {
      onDate: 0,
      fromDate: 0,
      year2024: 0,
      details: [
        {
          id: '3290625003XXXXXXX',
          description: 'The victim joined an unknown WhatsApp group related to trading, where the suspect promoted IPO stock trading opportunities. The suspect requested an investment, victim realized it was a scam and had been defrauded. Total Lost Amount : Rs. 26,00000/-'
        }
      ]
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 9: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, reset to default values
      console.log('Table 9: No localStorage data, resetting to default values');
      setTableData({
        above50Lakh: {
          onDate: 0,
          fromDate: 0,
          year2024: 0,
          details: [
            {
              id: '3290625003XXXXXXX',
              description: 'The victim joined an unknown WhatsApp group related to trading, where the suspect promoted IPO stock trading opportunities. The suspect requested an investment, victim realized it was a scam and had been defrauded. Total Lost Amount : Rs. 26,00000/-'
            }
          ]
        }
      });
    }
  }, [date, data]);

  const handleChange = (period, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      above50Lakh: {
        ...tableData.above50Lakh,
        [period]: newValue
      }
    };
    setTableData(newData);
    if (onDataChange) onDataChange(newData);
  };

  const handleDetailsChange = (index, field, value) => {
    const newDetails = [...tableData.above50Lakh.details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value
    };
    const newData = {
      ...tableData,
      above50Lakh: {
        ...tableData.above50Lakh,
        details: newDetails
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

  // Render an editable text area
  const EditableTextArea = ({ value, onChange }) => {
    return editMode ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded min-h-[100px]"
      />
    ) : (
      <div className="whitespace-pre-wrap">{value}</div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Table */}
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
              <td className="border border-gray-300 px-4 py-2">Above 50 Lakh</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.above50Lakh.onDate}
                  onChange={(value) => handleChange('onDate', value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.above50Lakh.fromDate}
                  onChange={(value) => handleChange('fromDate', value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.above50Lakh.year2024}
                  onChange={(value) => handleChange('year2024', value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Details Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-50 w-1/3">Case ID</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-50">Description</th>
            </tr>
          </thead>
          <tbody>
            {tableData.above50Lakh.details.map((detail, index) => (
              <tr key={detail.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {editMode ? (
                    <input
                      type="text"
                      value={detail.id}
                      onChange={(e) => handleDetailsChange(index, 'id', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    detail.id
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <EditableTextArea
                    value={detail.description}
                    onChange={(value) => handleDetailsChange(index, 'description', value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table9_Above50Lakh; 