"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function AdminLoginForm(){
 const router=useRouter();const[email,setEmail]=useState(""),[password,setPassword]=useState(""),[errorMessage,setErrorMessage]=useState(""),[loading,setLoading]=useState(false);
 async function fallbackSupabase(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return false;
  const supabase=createBrowserClient(url,key);
  const {error}=await supabase.auth.signInWithPassword({email,password});
  return !error;
 }
 async function handleSubmit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setErrorMessage("");try{
   const response=await fetch("/api/admin/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});
   if(response.ok){router.replace("/admin");router.refresh();return}
   const data=await response.json().catch(()=>({}));
   if(response.status===503 && await fallbackSupabase()){router.replace("/admin");router.refresh();return}
   setErrorMessage(data.error||"Incorrect email or password.");
  }catch{setErrorMessage("Could not connect to the admin login service.")}finally{setLoading(false)}}
 return <form className="admin-login-form" onSubmit={handleSubmit}><label className="admin-field"><span>Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label><label className="admin-field"><span>Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{errorMessage&&<p role="alert">{errorMessage}</p>}<button type="submit" className="primary-btn" disabled={loading}>{loading?"Signing in…":"Sign in"}</button></form>
}
