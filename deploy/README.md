# Running your family's copy

One family, one copy: a Supabase project for the data and a Vercel project for the app. About 30 minutes the first time.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com). Pick the region closest to you. Under **Security**, keep **Enable Data API** on, turn **Automatically expose new tables** off (the migrations grant access table by table), and turn **Enable automatic RLS** on.
2. **Authentication → Sign In / Providers → Email**: leave Email on and turn **Allow new users to sign up** off. Guardians are added by the seed script below, never by signing up.
3. **Authentication → URL Configuration**: set **Site URL** to your Vercel address (step 3), and add both `http://localhost:3000/**` and `https://<your-app>.vercel.app/**` to **Redirect URLs**.
4. Leave the email templates alone for now. With Supabase's built-in sender, the sign-in email holds only a link, so open it in the same browser you signed in from. That sender allows only a few emails an hour, which is enough for two guardians.
5. Later (phase 5, when Resend is set up for the digest), add Resend as custom SMTP under **Authentication → Emails → SMTP**. Then the **Magic link or OTP** template becomes editable, and you can add the code so it can be typed instead:

   ```html
   <h2>Sign in to Quark</h2>
   <p>Your code: <strong>{{ .Token }}</strong></p>
   <p>Or <a href="{{ .ConfirmationURL }}">sign in with this link</a>.</p>
   ```

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
