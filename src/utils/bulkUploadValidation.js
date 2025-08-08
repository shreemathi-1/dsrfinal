import * as XLSX from 'xlsx';

// Required columns in exact order
export const REQUIRED_COLUMNS = [
  'S.No.',
  'Acknowledgement No.',
  'State Name',
  'District Name',
  'Police Station',
  'Crime Additional Information',
  'Category',
  'Sub Category',
  'Status',
  'Incident Date',
  'Complaint Date',
  'Last Action Taken on',
  'Fraudulent Amount',
  'Lien Amount',
  'Suspect Name',
  'Suspect Mobile No',
  'Suspect Id No.',
  'Complainant Name',
  'Complainant Address',
  'Complainant Mobile No.',
  'Complainant Email'
];

// Function to validate file extension
export const isValidFileType = (filename) => {
  const validExtensions = ['.csv', '.xlsx', '.xls'];
  return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

// Function to parse file and validate columns
export const parseAndValidateFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        
        // Add more options to handle different Excel formats
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: true,
          cellNF: false,
          cellText: false,
          dateNF: 'yyyy-mm-dd'
        });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject({ error: 'Excel file appears to be empty' });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          reject({ error: 'Excel sheet appears to be empty' });
          return;
        }

        // Get the range of the sheet
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        if (!range || range.e.r < 1) { // Check if we have at least 2 rows
          reject({ error: 'Excel file must contain at least a header row and one data row' });
          return;
        }

        // Convert to JSON with more lenient options
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          defval: '',
          blankrows: false,
          range: range // Use the actual range of data
        });

        // Debug log
        console.log('Parsed Excel data:', {
          totalRows: jsonData.length,
          firstRowLength: jsonData[0]?.length,
          firstRow: jsonData[0]
        });

        // Clean and validate the data
        const cleanData = jsonData.filter(row => 
          Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')
        );

        if (!cleanData || cleanData.length === 0) {
          reject({ error: 'No valid data found in the Excel file' });
          return;
        }

        // Get headers from the first row
        const headers = cleanData[0].map(h => String(h || '').trim());
        
        // Debug log
        console.log('Headers found:', headers);

        // Check if we have valid headers
        if (headers.length === 0 || headers.every(h => h === '')) {
          reject({ error: 'No valid column headers found in the Excel file' });
          return;
        }

        // Convert remaining rows to objects
        const rows = cleanData.slice(1)
          .map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              if (header) {
                let value = row[index];
                // Convert empty values to empty string
                if (value === null || value === undefined) value = '';
                // Convert numbers to strings if needed
                if (typeof value === 'number') value = value.toString();
                obj[header] = value;
              }
            });
            return obj;
          })
          .filter(row => Object.values(row).some(val => val !== '')); // Remove empty rows

        // Debug log
        console.log('Processed rows:', rows.length);

        if (rows.length === 0) {
          reject({ error: 'No valid data rows found after header row' });
          return;
        }

        resolve({
          headers,
          data: rows
        });
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject({ 
          error: 'Failed to parse Excel file. Please ensure it is a valid Excel file.',
          details: error.message
        });
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject({ error: 'Failed to read file', details: error.message });
    };

    reader.readAsArrayBuffer(file);
  });
};

// Function to generate error message
export const generateErrorMessage = (validationError) => {
  const messages = [];

  if (validationError.missingColumns?.length > 0) {
    messages.push(`Missing columns: ${validationError.missingColumns.join(', ')}`);
  }

  if (validationError.wrongOrderColumns?.length > 0) {
    messages.push('Columns in wrong order:');
    validationError.wrongOrderColumns.forEach(col => {
      messages.push(`  - "${col.column}" should be in position ${col.expectedPosition} but found at ${col.actualPosition}`);
    });
  }

  return messages.join('\n');
};

// Function to generate template file
export const generateTemplate = (format = 'xlsx') => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with headers only
  const ws = XLSX.utils.aoa_to_sheet([REQUIRED_COLUMNS]);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  
  // Generate buffer
  const wbout = XLSX.write(wb, { type: 'buffer', bookType: format });
  
  return new Blob([wbout], { 
    type: format === 'csv' 
      ? 'text/csv;charset=utf-8' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}; 