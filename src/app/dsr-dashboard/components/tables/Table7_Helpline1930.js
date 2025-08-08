import { useState, useEffect } from 'react';

const Table7_Helpline1930 = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    summary: {
      totalCalls: { onDate: 0, fromDate: 0 },
      totalComplaints: { onDate: 0, fromDate: 0 }
    },
    categories: {
      aadharEnabled: { onDate: 0, fromDate: 0 },
      emailCompromise: { onDate: 0, fromDate: 0 },
      cardFraud: { onDate: 0, fromDate: 0 },
      dematFraud: { onDate: 0, fromDate: 0 },
      eWalletFraud: { onDate: 0, fromDate: 0 },
      fraudCall: { onDate: 0, fromDate: 0 },
      internetBanking: { onDate: 0, fromDate: 0 },
      upiFraud: { onDate: 0, fromDate: 0 },
      complaintTransfer: { onDate: 0, fromDate: 0 }
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 7: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, reset to default values
      console.log('Table 7: No localStorage data, resetting to default values');
      setTableData({
        summary: {
          totalCalls: { onDate: 0, fromDate: 0 },
          totalComplaints: { onDate: 0, fromDate: 0 }
        },
        categories: {
          aadharEnabled: { onDate: 0, fromDate: 0 },
          emailCompromise: { onDate: 0, fromDate: 0 },
          cardFraud: { onDate: 0, fromDate: 0 },
          dematFraud: { onDate: 0, fromDate: 0 },
          eWalletFraud: { onDate: 0, fromDate: 0 },
          fraudCall: { onDate: 0, fromDate: 0 },
          internetBanking: { onDate: 0, fromDate: 0 },
          upiFraud: { onDate: 0, fromDate: 0 },
          complaintTransfer: { onDate: 0, fromDate: 0 }
        }
      });
    }
  }, [date, data]);

  const handleChange = (section, category, period, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [section]: {
        ...tableData[section],
        [category]: {
          ...tableData[section][category],
          [period]: newValue
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

  const getCategoryLabel = (key) => {
    const labels = {
      aadharEnabled: "Aadhar Enabled payment system",
      emailCompromise: "Email compromise / email take over",
      cardFraud: "Debit/credit card fraud/sim swap fraud",
      dematFraud: "Demat/Depository fraud",
      eWalletFraud: "E-Wallet related fraud",
      fraudCall: "Fraud call/Vishing",
      internetBanking: "Internet banking related fraud",
      upiFraud: "UPI related frauds",
      complaintTransfer: "Complaint transfer to/come from other state"
    };
    return labels[key] || key;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50">1930 Calls</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">On {date}</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">From 01.01.25 to till Date</th>
          </tr>
        </thead>
        <tbody>
          {/* Summary Section */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Total No. of calls received</td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.summary.totalCalls.onDate}
                onChange={(value) => handleChange('summary', 'totalCalls', 'onDate', value)}
              />
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.summary.totalCalls.fromDate}
                onChange={(value) => handleChange('summary', 'totalCalls', 'fromDate', value)}
              />
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Total No. of complaints registered in NCRP</td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.summary.totalComplaints.onDate}
                onChange={(value) => handleChange('summary', 'totalComplaints', 'onDate', value)}
              />
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <EditableCell
                value={tableData.summary.totalComplaints.fromDate}
                onChange={(value) => handleChange('summary', 'totalComplaints', 'fromDate', value)}
              />
            </td>
          </tr>
          
          {/* Category Header */}
          <tr>
            <td colSpan="3" className="border border-gray-300 px-4 py-2 bg-gray-100 font-medium">Category</td>
          </tr>

          {/* Categories */}
          {Object.entries(tableData.categories).map(([key, values], index) => (
            <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2">{getCategoryLabel(key)}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={values.onDate}
                  onChange={(value) => handleChange('categories', key, 'onDate', value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={values.fromDate}
                  onChange={(value) => handleChange('categories', key, 'fromDate', value)}
                />
              </td>
            </tr>
          ))}

          {/* Total Row */}
          <tr className="bg-gray-100 font-medium">
            <td className="border border-gray-300 px-4 py-2">Total</td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.categories).reduce((sum, values) => sum + values.onDate, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.categories).reduce((sum, values) => sum + values.fromDate, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table7_Helpline1930; 