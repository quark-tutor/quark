# Running your family's copy

One family, one copy: a Supabase project for the data and a Vercel project for the app. About 30 minutes the first time.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com). Pick the region closest to you.
2. **Authentication → Sign In / Providers → Email**: leave Email on and turn **Allow new users to sign up** off. Guardians are added by the seed script below, never by signing up.
3. **Authentication → Emails → Magic Link**: replace the template body with the one below, so the email carries a code you can type as well as a link.

   ```html
   <h2>Sign in to Quark</h2>
   <p>Your code: <strong>{{ .Token }}</strong></p>
   <p>Or <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">sign in with this link</a>.</p>
   ```

4. **Authentication → URL Configuration**: set **Site URL** to your Vercel address (step 3) and add `http://localhost:3000/**` to **Redirect URLs**.
5. Supabase's built-in email sender allows only a few messages an hour. That's enough for two guardians. Later, set up custom SMTP with Resend under **Authentication → Emails → SMTP**.

## 2. Local setup and the database

```sh
npm install
cp .env.example .env.local      # then fill in the four values
npm run db:push                 # applies supabase/migrations to your project
cp scripts/family.example.json scripts/family.local.json   # then edit it
npm run seed                    # creates your family, guardians and children
npm run dev                     # http://localhost:3000/parent
```

`scripts/family.local.json` is gitignored. Keep children to a nickname, birth month, sex, reading level and interests. Never a full name, photo, school or address.

## 3. Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). The defaults for Next.js are right.
2. Add three environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. `SUPABASE_DB_URL` stays on your laptop.
3. Deploy. Put the address it gives you into Supabase's **Site URL** (step 1.4).

## 4. Each iPad

1. In Safari, open `https://<your-app>.vercel.app/kid`.
2. Tap **Share → Add to Home Screen**. Open Quark from the Home Screen icon, not from Safari. On iPad, a Home Screen app keeps its own cookies, separate from Safari's, so it must be paired from inside the app.
3. On your laptop, open `/parent`, choose the child and tap **Get a code**. Type the six digits on the iPad. The code works once, for ten minutes.
4. Lock it: **Settings → Accessibility → Guided Access** on, set a passcode, then open Quark and triple-click the top button to start.

To unpair an iPad, use **Forget this iPad** on `/parent`. The iPad goes back to the code screen the next time it loads.
