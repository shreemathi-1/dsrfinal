# DSR Database Setup Guide

This guide will help you set up the database tables for the DSR (Daily Situation Report) functionality.

## Prerequisites

1. **Supabase Account**: You need a Supabase project set up
2. **Environment Variables**: Make sure your `.env.local` file has the correct Supabase credentials

## Database Schema Setup

### Step 1: Create the Database Tables

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire content from `create_dsr_tables.sql` file
4. Click "Run" to execute the SQL

### Step 2: Verify Tables Created

After running the SQL, you should see these tables in your Supabase dashboard:

1. **dsr_complaints** - Stores complaints data (financial and non-financial)
2. **dsr_stages** - Stores case stages data
3. **dsr_amount** - Stores amount-related data

### Step 3: Check Row Level Security (RLS)

The tables have Row Level Security enabled, which means:
- Users can only access their own data
- Each user's data is isolated from others
- Data is automatically filtered by `created_by` field

## Table Structures

### 1. DSR Complaints Table (`dsr_complaints`)

**Purpose**: Stores complaints data with financial and non-financial categories

**Key Fields**:
- `report_date`: The date of the report
- `from_date`: The start date for cumulative data
- `financial_*`: Financial complaint statistics
- `non_financial_*`: Non-financial complaint statistics
- `created_by`: User ID who created the record

**Data Structure**:
- On Date: Current day statistics
- From Date: Cumulative statistics from start of year
- Data 2024: Year-to-date statistics

### 2. DSR Stages Table (`dsr_stages`)

**Purpose**: Stores case stage progression data

**Key Fields**:
- `report_date`: The date of the report
- `from_date`: The start date for cumulative data
- `on_date_*`: Current day stage statistics
- `from_date_*`: Cumulative stage statistics
- `created_by`: User ID who created the record

**Stages Tracked**:
- Total Complaints
- UI (Under Investigation)
- PT (Pending)
- Disposal

### 3. DSR Amount Table (`dsr_amount`)

**Purpose**: Stores amount-related data for different categories

**Key Fields**:
- `report_date`: The date of the report
- `from_date`: The start date for cumulative data
- `category`: Type of amount (Lost, Frozen, Returned, etc.)
- `on_date_amount`: Current day amount
- `from_date_amount`: Cumulative amount
- `data_2024_amount`: Year-to-date amount
- `created_by`: User ID who created the record

**Categories**:
- Amount Lost
- Amount Frozen
- Amount Returned
- Amount Seized
- Amount Confiscated

## Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the officer dashboard** and try to:
   - Fill data in any DSR table
   - Save the data
   - Refresh the page and verify data persists
   - Check different dates to ensure data isolation

3. **Check Supabase Dashboard**:
   - Go to your Supabase dashboard
   - Navigate to Table Editor
   - Check the `dsr_complaints`, `dsr_stages`, and `dsr_amount` tables
   - Verify that data is being saved correctly

## Troubleshooting

### Common Issues:

1. **"User not authenticated" error**:
   - Make sure you're logged in to the application
   - Check that Supabase auth is properly configured

2. **"Table doesn't exist" error**:
   - Verify that the SQL script ran successfully
   - Check that table names match exactly

3. **"Permission denied" error**:
   - Verify that RLS policies are correctly set up
   - Check that the user has the correct permissions

4. **Data not saving**:
   - Check browser console for errors
   - Verify network connectivity to Supabase
   - Check that environment variables are correct

### Debugging Steps:

1. **Check Browser Console**: Look for any JavaScript errors
2. **Check Network Tab**: Verify API calls to Supabase
3. **Check Supabase Logs**: Look for any server-side errors
4. **Verify Authentication**: Ensure user is properly authenticated

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication Required**: All operations require valid user authentication
- **Data Isolation**: Each user's data is completely isolated
- **Input Validation**: All numeric inputs are validated and sanitized

## Performance Considerations

- **Indexes**: Tables have indexes on frequently queried fields
- **Efficient Queries**: Database operations are optimized for common use cases
- **Caching**: Frontend caches data to reduce database calls

## Backup and Recovery

- **Automatic Backups**: Supabase provides automatic backups
- **Manual Export**: You can export data from Supabase dashboard
- **Version Control**: Database schema is version controlled in the SQL file

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Check the browser console for detailed error messages
4. Verify that all environment variables are correctly set 