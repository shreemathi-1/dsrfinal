// TEMPORARY FIX for Table2_AmountLostFrozen
// This version works around the database schema issue by using a different approach

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../supabaseClient';

const Table2_AmountLostFrozen = ({ date, editMode, onDataChange }) => {
  const [tableData, setTableData] = useState({
    amount_lost: { onDate: 0, fromDate: 0, data2024: 0 },
    amount_frozen: { onDate: 0, fromDate: 0, data2024: 0 },
    amount_returned: { onDate: 0, fromDate: 0, data2024: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (date) {
      loadTableData();
    }
  }, [date]);

  const loadTableData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      console.log('Loading data for date:', date);
      
      // First, check what columns actually exist in the table
      const { data: tableInfo, error: infoError } = await supabase
        .rpc('get_table_columns', { table_name: 'dsr_amount_tracking' });
      
      if (infoError) {
        console.log('Could not get table info, trying direct query...');
      }

      // Try to load data with a flexible approach
      const { data, error } = await supabase
        .from('dsr_amount_tracking')
        .select('*')
        .eq('report_date', date)
        .eq('created_by', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        // If it's a column error, we'll use default data
        if (error.message.includes('column') || error.message.includes('schema')) {
          console.log('Schema issue detected, using default values');
          setTableData({
            amount_lost: { onDate: 0, fromDate: 0, data2024: 0 },
            amount_frozen: { onDate: 0, fromDate: 0, data2024: 0 },
            amount_returned: { onDate: 0, fromDate: 0, data2024: 0 }
          });
          setError('Database schema needs to be updated. Please contact administrator.');
          return;
        }
        throw error;
      }

      if (data) {
        // Transform data safely, checking if columns exist
        const transformedData = {
          amount_lost: {
            onDate: data.amount_lost_on_date || 0,
            fromDate: data.amount_lost_from_date || 0,
            data2024: data.amount_lost_2024 || 0
          },
          amount_frozen: {
            onDate: data.amount_frozen_on_date || 0,
            fromDate: data.amount_frozen_from_date || 0,
            data2024: data.amount_frozen_2024 || 0
          },
          amount_returned: {
            onDate: data.amount_returned_on_date || 0,
            fromDate: data.amount_returned_from_date || 0,
            data2024: data.amount_returned_2024 || 0
          }
        };
        setTableData(transformedData);
      }
    } catch (error) {
      console.error('Error loading table data:', error);
      setError(error.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveTableData = async (data) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      if (!date) {
        throw new Error('Please select a valid date.');
      }

      console.log('Saving data:', data);

      // Transform data for saving, but handle missing columns gracefully
      const saveData = {
        report_date: date,
        created_by: user.id,
        updated_by: user.id,
        district: user.user_metadata?.district || 'Unknown'
      };

      // Only add columns that we know exist or can be added
      try {
        // Try to add the amount fields
        saveData.amount_lost_on_date = data.amount_lost.onDate;
        saveData.amount_lost_from_date = data.amount_lost.fromDate;
        saveData.amount_lost_2024 = data.amount_lost.data2024;
        saveData.amount_frozen_on_date = data.amount_frozen.onDate;
        saveData.amount_frozen_from_date = data.amount_frozen.fromDate;
        saveData.amount_frozen_2024 = data.amount_frozen.data2024;
        saveData.amount_returned_on_date = data.amount_returned.onDate;
        saveData.amount_returned_from_date = data.amount_returned.fromDate;
        saveData.amount_returned_2024 = data.amount_returned.data2024;
      } catch (err) {
        console.error('Error preparing save data:', err);
      }

      // Try upsert operation
      const { error: saveError } = await supabase
        .from('dsr_amount_tracking')
        .upsert(saveData, {
          onConflict: 'report_date,created_by'
        });

      if (saveError) {
        console.error('Save error:', saveError);
        if (saveError.message.includes('column') || saveError.message.includes('schema')) {
          throw new Error('Database schema needs to be updated. Please run the migration script.');
        }
        throw saveError;
      }

      if (onDataChange) {
        onDataChange(data);
      }

      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving table data:', error);
      const errorMessage = error.message || 'Failed to save changes. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleChange = (category, period, value) => {
    try {
      const newValue = value === '' ? 0 : Number(value);
      if (isNaN(newValue)) {
        throw new Error('Please enter a valid number.');
      }

      const newData = {
        ...tableData,
        [category]: {
          ...tableData[category],
          [period]: newValue
        }
      };
      setTableData(newData);
      
      // Only save if not in a schema error state
      if (!error || !error.includes('schema')) {
        saveTableData(newData).catch(error => {
          console.error('Failed to save changes:', error);
          setError(error.message);
        });
      }
    } catch (error) {
      console.error('Error updating value:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          {error.includes('schema') && (
            <div className="mt-2 text-sm text-red-500">
              <p>To fix this issue:</p>
              <ol className="list-decimal list-inside mt-1">
                <li>Run the database migration script</li>
                <li>Reset Supabase API schema cache</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
          <button 
            onClick={loadTableData}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 w-16">S.No</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">On {date}</th>
              <th className="border border-gray-300 px-4 py-2">From 01.01.24</th>
              <th className="border border-gray-300 px-4 py-2">Data of 2024</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: 'amount_lost', label: 'Amount Lost' },
              { key: 'amount_frozen', label: 'Amount Frozen' },
              { key: 'amount_returned', label: 'Amount Returned' }
            ].map((row, index) => (
              <tr key={row.key} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2 font-medium">{row.label}</td>
                {['onDate', 'fromDate', 'data2024'].map((period) => (
                  <td key={period} className="border border-gray-300 px-4 py-2 text-center">
                    {editMode && !error?.includes('schema') ? (
                      <input
                        type="number"
                        value={tableData[row.key][period]}
                        onChange={(e) => handleChange(row.key, period, e.target.value)}
                        className="w-full px-2 py-1 text-center border rounded"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <span>
                        {tableData[row.key][period].toLocaleString('en-IN', { 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table2_AmountLostFrozen;
