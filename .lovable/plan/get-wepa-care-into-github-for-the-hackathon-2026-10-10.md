# Get WEPA.care into GitHub for the hackathon

## What happens, in order

**1. Clean the repository contents (me)** — done before the repo exists, so the created repository never contains these files:
- The local backend configuration file and the internal planning-history folder stop being versioned. Both stay on the machine and keep working; they are simply no longer part of the shared code.
- The ignore list is updated so they can't be added back by accident.
- One short note is added to the project's own instructions so this stays true for anyone who works on it next.

**2. Write a hackathon README (me)** — replaces the current generic welcome file.

**3. Create the repository (you)** — the one step I cannot do, because it requires authorizing access with your GitHub account:
- Open the Plus (+) menu in the chat input, choose GitHub, then Connect project.
- Authorize the Lovable GitHub App, pick the account to create it under, click Create Repository.
- Set visibility to **Private** on that form.
- Once created, every change made here pushes automatically, and changes pushed to the repo come back here.

**4. Verify (me)** — confirm the repository holds the app code, imagery, tests and the new README, that the configuration and planning folders are absent, and that a later edit lands as a new commit.

## README contents
- One-paragraph pitch: Puerto Rico needs nurses; travel nurses from the mainland are the fastest fix; WEPA gets them ready and matched.
- The three sides in one line each: nurses, hospitals, tourism partners.
- The numbers that frame the problem (92% burnout, 63% seeking income, 50% pay gap, 42% staying in healthcare).
- How to run it locally and how to run the checks.
- A short judge walkthrough: build an assignment, publish it, find it as a nurse, apply, watch it land in the hospital pipeline.
- A clear note that every person, review, offer and billing figure is synthetic demo data.

## Technical details
- `.gitignore`: append `.env` and `.lovable/`; run `git rm -r --cached .env .lovable` so both are untracked but kept locally. No application code changes.
- `README.md`: rewritten in place with the pitch and demo script above.
- `AGENTS.md`: one rule added so the untracked state is not reversed later.
- GitHub authorization is an OAuth step only you can complete; I cannot create or push to the repository on your behalf.
- Fallback if authorization fails (account permissions, billing): I produce a push-ready source bundle with dependencies and secrets excluded, plus the exact commands to push it to a private repository.
- After connecting, published history must not be rewritten (no force push, no rebasing commits already pushed) — the existing project note already warns about this, and doing it would cost you project history.

## Validation
- Ignore-list change: local app still runs, type-check and tests still pass, working tree stays clean.
- After you create the repository: list its files, confirm the configuration file and planning folder are absent and the README is present, then make a trivial edit here and confirm a new commit appears there.
