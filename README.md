# S Center — deployment guide

This package is ready for Cloudflare Pages + Supabase. It keeps products and uploaded product images online after publishing.

## 1. Create the database and image storage

1. Create a project at https://supabase.com.
2. Open **SQL Editor**, create a query, paste the complete contents of `supabase/SETUP.sql`, then select **Run**.
3. Open **Authentication -> Users -> Add user** and create the administrator account with the required email and password.
4. In **Settings -> API**, copy the **Project URL** and **anon public key**.
5. Paste them into `supabase-config.js`. Do not put a service-role key in this file.

## 2. Publish with Cloudflare Pages

1. Make a free account at https://dash.cloudflare.com.
2. Open **Workers & Pages -> Create -> Pages -> Upload assets**.
3. Upload the contents of this folder, not the folder itself.
4. Choose a project name, then select **Deploy**.
5. Add a domain under **Custom domains** when ready.

## How admin uploads work

Open `login.html`, sign in using the Supabase Authentication account, then add, edit, or delete products. The product record is saved in Supabase Database and its image goes to Supabase Storage, so it remains visible on the hosted website for every customer.

## Important

The website works in local demo mode until `supabase-config.js` is filled. After Supabase is connected, it uses the cloud database automatically.
