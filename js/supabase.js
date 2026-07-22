/**
 * Supabase Initialization
 */
const supabaseUrl = 'https://fikqjfhprwhlumbrcugt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa3FqZmhwcndobHVtYnJjdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDE0MTEsImV4cCI6MjEwMDI3NzQxMX0.qv_dE4aRyeDMZ-soh5vjaM8_Pil20-7hDKZs8inIjHA';

// Initialize Supabase Client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
