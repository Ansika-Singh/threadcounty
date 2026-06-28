import { supabase } from "@/integrations/supabase/client";
import { mockSupabase } from "@/integrations/supabase/mock-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // Intercept all API calls and route them to local storage to completely remove backend/Supabase access
  if (endpoint === "/dashboard") {
    const { data: reports } = await mockSupabase.from("reports").order("created_at", { ascending: false }).limit(5);
    const { data: uploads } = await mockSupabase.from("uploads");
    const totalBytes = uploads?.reduce((acc: number, cur: any) => acc + (cur.file_size || 0), 0) || 0;
    return { 
      uploads_count: uploads?.length || 0,
      recent_reports: reports || [],
      profile: session?.user?.user_metadata || {},
      subscription: { plan: "free", status: "active" },
      notifications: [],
      total_bytes: totalBytes,
      activity: []
    };
  }
  
  if (endpoint === "/uploads" && options.method === "POST") {
    const row = { 
      id: crypto.randomUUID(),
      user_id: session?.user?.id || "mock-user-id-999",
      created_at: new Date().toISOString()
    };
    await mockSupabase.from("uploads").insert(row);
    return { upload: row };
  }
  
  if (endpoint.startsWith("/reports?upload_id=") && options.method === "POST") {
    const upload_id = endpoint.split("upload_id=")[1];
    const row = { 
      id: crypto.randomUUID(), 
      upload_id, 
      user_id: session?.user?.id || "mock-user-id-999",
      status: "completed", 
      thread_density: Math.floor(Math.random() * 50) + 50, 
      warp_count: Math.floor(Math.random() * 30) + 30, 
      weft_count: Math.floor(Math.random() * 30) + 20, 
      fabric_type: "Local Mock Fabric", 
      weave_pattern: "Local Weave", 
      confidence_score: 98.5,
      ai_suggestions: "This is a locally generated analysis. Backend processing is disabled.",
      created_at: new Date().toISOString()
    };
    await mockSupabase.from("reports").insert(row);
    return { report: row };
  }

  throw new Error("Backend API is permanently disabled. Endpoint not mocked: " + endpoint);
}
