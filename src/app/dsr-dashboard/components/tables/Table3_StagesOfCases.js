import { useState, useEffect } from 'react';

const CASE_STAGES = [
  'case_registered',
  'charge_sheet_filed',
  'charge_sheet_taken_on_file',
  'final_report_filed',
  'final_report_taken_on_file',
  'cases_charge_sheeted',
  'cases_convicted',
  'cases_acquitted',
  'cases_compounded',
  'cases_withdrawn',
  'cases_transferred',
  'cases_pending_trial',
  'cases_pending_investigation'
];

const Table3_StagesOfCases = ({ date, editMode, data, onDataChange }) => {
  // Initialize with default data immediately to prevent empty object issues
  const getDefaultData = () => {
    const defaultData = {};
    CASE_STAGES.forEach(stage => {
      defaultData[stage] = { today: 0, ytd: 0 };
    });
    return defaultData;
  };

  const [tableData, setTableData] = useState(getDefaultData());

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 3: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, use default values
      console.log('Table 3: No localStorage data, using default values');
      setTableData(getDefaultData());
    }
  }, [date, data]);

  const handleChange = (stage, field, value) => {
    const numValue = parseInt(value) || 0;
    const newData = {
      ...tableData,
      [stage]: { ...tableData[stage], [field]: numValue }
    };
    setTableData(newData);
    
    // Call onDataChange to update parent component's state (for localStorage saving)
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const formatFieldName = (field) => {
    return field.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 w-16">S.No</th>
              <th className="border border-gray-300 px-4 py-2">Case Stage</th>
              <th className="border border-gray-300 px-4 py-2">Today</th>
              <th className="border border-gray-300 px-4 py-2">2024 YTD</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tableData).map(([stage, values], index) => (
              <tr key={stage} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {formatFieldName(stage)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {editMode ? (
                    <input
                      type="number"
                      value={values.today}
                      onChange={(e) => handleChange(stage, 'today', e.target.value)}
                      className="w-full px-2 py-1 text-center border rounded"
                      min="0"
                      step="1"
                    />
                  ) : (
                    values.today.toLocaleString()
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {editMode ? (
                    <input
                      type="number"
                      value={values.ytd}
                      onChange={(e) => handleChange(stage, 'ytd', e.target.value)}
                      className="w-full px-2 py-1 text-center border rounded"
                      min="0"
                      step="1"
                    />
                  ) : (
                    values.ytd.toLocaleString()
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default Table3_StagesOfCases; 