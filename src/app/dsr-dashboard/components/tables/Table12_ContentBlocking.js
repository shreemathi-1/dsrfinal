import { useState, useEffect } from 'react';
import { getCCPSDataForDSRTable12 } from '@/lib/ccpsTable3Utils';

const Table12_ContentBlocking = ({ date, editMode, data, onDataChange }) => {
  const [tableData, setTableData] = useState({
    onDate: {
      facebook: { ccps: 0, hqrs: 0 },
      twitter: { ccps: 0, hqrs: 0 },
      youtube: { ccps: 0, hqrs: 0 },
      instagram: { ccps: 0, hqrs: 0 },
      loanApps: { ccps: 0, hqrs: 0 },
      otherApps: { ccps: 0, hqrs: 0 },
      websites: { ccps: 0, hqrs: 0 },
      telegram: { ccps: 0, hqrs: 0 },
      whatsapp: { ccps: 0, hqrs: 0 }
    },
    fromDate: {
      facebook: { ccps: 0, hqrs: 0 },
      twitter: { ccps: 0, hqrs: 0 },
      youtube: { ccps: 0, hqrs: 0 },
      instagram: { ccps: 0, hqrs: 0 },
      loanApps: { ccps: 0, hqrs: 0 },
      otherApps: { ccps: 0, hqrs: 0 },
      websites: { ccps: 0, hqrs: 0 },
      telegram: { ccps: 0, hqrs: 0 },
      whatsapp: { ccps: 0, hqrs: 0 }
    },
    blocked: {
      facebook: { ccps: 0, hqrs: 0 },
      twitter: { ccps: 0, hqrs: 0 },
      youtube: { ccps: 0, hqrs: 0 },
      instagram: { ccps: 0, hqrs: 0 },
      loanApps: { ccps: 0, hqrs: 0 },
      otherApps: { ccps: 0, hqrs: 0 },
      websites: { ccps: 0, hqrs: 0 },
      telegram: { ccps: 0, hqrs: 0 },
      whatsapp: { ccps: 0, hqrs: 0 }
    },
    pending: {
      facebook: { ccps: 0, hqrs: 0 },
      twitter: { ccps: 0, hqrs: 0 },
      youtube: { ccps: 0, hqrs: 0 },
      instagram: { ccps: 0, hqrs: 0 },
      loanApps: { ccps: 0, hqrs: 0 },
      otherApps: { ccps: 0, hqrs: 0 },
      websites: { ccps: 0, hqrs: 0 },
      telegram: { ccps: 0, hqrs: 0 },
      whatsapp: { ccps: 0, hqrs: 0 }
    }
  });

  // Use data from props (localStorage) and integrate with CCPS Table 3 data
  useEffect(() => {
    // Handle different date formats from DSR reports
    let currentDate;
    if (typeof date === 'string') {
      // Check if it's YYYY-MM-DD format (from DSR reports)
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        currentDate = date; // Use string directly for CCPS utility
        console.log('Table 12: Using YYYY-MM-DD date format:', currentDate);
      } else {
        // Convert date string like '19.06.25' to proper Date
        const parts = date.split('.');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = 2000 + parseInt(parts[2]); // Assuming 2000s
          currentDate = new Date(year, month, day);
        } else {
          currentDate = new Date();
        }
      }
    } else {
      currentDate = date || new Date();
    }

    // Get CCPS Table 3 social media data
    const ccpsData = getCCPSDataForDSRTable12(currentDate);
    console.log('Table 12: Using date for CCPS lookup:', currentDate);
    console.log('Table 12: CCPS Social Media Data:', ccpsData);

    if (data && Object.keys(data).length > 0) {
      // Use data from localStorage but update CCPS columns with CCPS data
      console.log('Table 12: Using data from localStorage:', data);
      const updatedData = {
        onDate: {},
        fromDate: {},
        blocked: {},
        pending: {}
      };

      // Update each section with CCPS data while preserving Hqrs values
      Object.keys(ccpsData).forEach(section => {
        updatedData[section] = {};
        Object.keys(ccpsData[section]).forEach(platform => {
          updatedData[section][platform] = {
            ccps: ccpsData[section][platform].ccps, // Auto-populate from CCPS
            hqrs: data[section] && data[section][platform] ? data[section][platform].hqrs : 0 // Preserve existing Hqrs value
          };
        });
      });

      setTableData(updatedData);
    } else {
      // If no localStorage data, use CCPS data with default Hqrs values
      console.log('Table 12: No localStorage data, using CCPS integration with defaults');
      const defaultDataWithCCPS = {
        onDate: {},
        fromDate: {},
        blocked: {},
        pending: {}
      };

      // Initialize with CCPS data and default Hqrs values
      Object.keys(ccpsData).forEach(section => {
        defaultDataWithCCPS[section] = {};
        Object.keys(ccpsData[section]).forEach(platform => {
          defaultDataWithCCPS[section][platform] = {
            ccps: ccpsData[section][platform].ccps, // Auto-populate from CCPS
            hqrs: 0 // Default value for manual entry
          };
        });
      });

      setTableData(defaultDataWithCCPS);
    }
  }, [date, data]);

  const handleChange = (section, platform, org, value) => {
    // Prevent editing CCPS columns as they're auto-populated from CCPS Table 3
    if (org === 'ccps') {
      console.log('Table 12: CCPS columns are read-only (populated from CCPS Table 3)');
      return;
    }

    const newValue = value === '' ? 0 : Number(value);
    const newData = {
      ...tableData,
      [section]: {
        ...tableData[section],
        [platform]: {
          ...tableData[section][platform],
          [org]: newValue
        }
      }
    };
    setTableData(newData);
    if (onDataChange) onDataChange(newData);
  };

  // Render an editable cell
  const EditableCell = ({ value, onChange, isReadOnly = false }) => {
    if (isReadOnly) {
      return (
        <span className="text-blue-600 font-medium" title="Auto-populated from CCPS Table 3">
          {value}
        </span>
      );
    }
    
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

  const platforms = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'twitter', label: 'Twitter' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'loanApps', label: 'Loan Apps' },
    { key: 'otherApps', label: 'Other Apps' },
    { key: 'websites', label: 'Websites' },
    { key: 'telegram', label: 'Telegram' },
    { key: 'whatsapp', label: 'WhatsApp' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50">S.No</th>
            <th rowSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50">Intermediary</th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              No. of requests sent on {date}
            </th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              No.of Contents blocked
            </th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              No.of requests sent from 01.01.25 to till Date
            </th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              No.of Contents blocked
            </th>
            <th colSpan="2" className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">
              No.of requests Pending
            </th>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">CCPS</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Hqrs</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">CCPS</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Hqrs</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">CCPS</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Hqrs</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">CCPS</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Hqrs</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">CCPS</th>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-center">Hqrs</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((platform, index) => (
            <tr key={platform.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">{platform.label}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.onDate[platform.key].ccps}
                  onChange={(value) => handleChange('onDate', platform.key, 'ccps', value)}
                  isReadOnly={true}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.onDate[platform.key].hqrs}
                  onChange={(value) => handleChange('onDate', platform.key, 'hqrs', value)}
                  isReadOnly={false}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.blocked[platform.key].ccps}
                  onChange={(value) => handleChange('blocked', platform.key, 'ccps', value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.blocked[platform.key].hqrs}
                  onChange={(value) => handleChange('blocked', platform.key, 'hqrs', value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.fromDate[platform.key].ccps}
                  onChange={(value) => handleChange('fromDate', platform.key, 'ccps', value)}
                  isReadOnly={true}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.fromDate[platform.key].hqrs}
                  onChange={(value) => handleChange('fromDate', platform.key, 'hqrs', value)}
                  isReadOnly={false}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.blocked[platform.key].ccps}
                  onChange={(value) => handleChange('blocked', platform.key, 'ccps', value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.blocked[platform.key].hqrs}
                  onChange={(value) => handleChange('blocked', platform.key, 'hqrs', value)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.pending[platform.key].ccps}
                  onChange={(value) => handleChange('pending', platform.key, 'ccps', value)}
                  isReadOnly={true}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <EditableCell
                  value={tableData.pending[platform.key].hqrs}
                  onChange={(value) => handleChange('pending', platform.key, 'hqrs', value)}
                  isReadOnly={false}
                />
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-medium">
            <td colSpan="2" className="border border-gray-300 px-4 py-2">Total</td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.onDate).reduce((sum, val) => sum + val.ccps, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.onDate).reduce((sum, val) => sum + val.hqrs, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.blocked).reduce((sum, val) => sum + val.ccps, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.blocked).reduce((sum, val) => sum + val.hqrs, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.fromDate).reduce((sum, val) => sum + val.ccps, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.fromDate).reduce((sum, val) => sum + val.hqrs, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.blocked).reduce((sum, val) => sum + val.ccps, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.blocked).reduce((sum, val) => sum + val.hqrs, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.pending).reduce((sum, val) => sum + val.ccps, 0)}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              {Object.values(tableData.pending).reduce((sum, val) => sum + val.hqrs, 0)}
            </td>
          </tr>
          <tr>
            <td colSpan="12" className="border border-gray-300 px-4 py-2 text-center">2024</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table12_ContentBlocking; 