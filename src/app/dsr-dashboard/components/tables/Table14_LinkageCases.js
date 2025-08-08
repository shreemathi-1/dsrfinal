import { useState, useEffect } from 'react';

const Table14_LinkageCases = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    interstate: {
      onDate: {
        directLinkages: 0,
        formalArrests: 0,
        arrestsPending: 0,
        linkagesClosed: 0
      },
      fromDate: {
        directLinkages: 0,
        formalArrests: 0,
        arrestsPending: 0,
        linkagesClosed: 0
      }
    },
    intrastate: {
      onDate: {
        directLinkages: 0,
        formalArrests: 0,
        arrestsPending: 0,
        linkagesClosed: 0
      },
      fromDate: {
        directLinkages: 0,
        formalArrests: 0,
        arrestsPending: 0,
        linkagesClosed: 0
      }
    }
  });

  // Use data from props (localStorage) only - no database calls
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage (passed via props)
      console.log('Table 14: Using data from localStorage:', data);
      setTableData(data);
    } else {
      // If no localStorage data, keep default values (already initialized)
      console.log('Table 14: No localStorage data, using default values');
    }
  }, [date, data]);

  const handleChange = (type, period, field, value) => {
    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [type]: {
        ...tableData[type],
        [period]: {
          ...tableData[type][period],
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
    { key: 'directLinkages', label: 'No of cases with Direct Linkages received in JMIS portal and through Tapal' },
    { key: 'formalArrests', label: 'No. of formal arrests made' },
    { key: 'arrestsPending', label: 'No. of formal arrests pending' },
    { key: 'linkagesClosed', label: 'No. of linkages closed' }
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">
                Inter and Intrastate Linkage Cases
              </th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                Interstate cases on {date}
              </th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                Interstate cases from 01.01.25 to till Date
              </th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                Intrastate cases on {date}
              </th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
                Intrastate cases from 01.01.25 to till Date
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2">{row.label}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.interstate.onDate[row.key]}
                    onChange={(value) => handleChange('interstate', 'onDate', row.key, value)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.interstate.fromDate[row.key]}
                    onChange={(value) => handleChange('interstate', 'fromDate', row.key, value)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.intrastate.onDate[row.key]}
                    onChange={(value) => handleChange('intrastate', 'onDate', row.key, value)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <EditableCell
                    value={tableData.intrastate.fromDate[row.key]}
                    onChange={(value) => handleChange('intrastate', 'fromDate', row.key, value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-sm text-gray-700">
        <strong>*Note:</strong> "Linkages closed" implies formal arrest cannot be executed for that case as complaints
        are withdrawn by the victim and case closed by CCPS (or) Linkage found invalid after
        investigation.
      </div>
    </div>
  );
};

export default Table14_LinkageCases; 