
import { createClient } from '@supabase/supabase-js';

// 优先读取环境变量 (Vercel/Production)，如果读取不到则使用硬编码 (本地开发/Fallback)
// 变量名必须以 VITE_ 开头，否则 Vite 无法在前端暴露它
// 添加 .trim() 以防止复制粘贴时产生的意外空格
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://vacbzfmxuruzvhkpsdze.supabase.co').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhY2J6Zm14dXJ1enZoa3BzZHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDg0MDEsImV4cCI6MjA3OTc4NDQwMX0.o3BKfdRG555FqboFCw31ULSlIRxpfSNdZd2iHR7uBjM').trim(); 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
