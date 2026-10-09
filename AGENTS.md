<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep major marketplace experiences role-oriented while sharing one domain model, because the judge demo must traverse all three sides coherently.
- Localize presentation through the shared language provider and English-keyed Spanish catalog; preserve canonical stored values and explicit option values so changing language never alters marketplace state.
- Keep community, review, and testimonial demo state in one typed local store so every nurse-facing surface stays consistent without implying real members or verified reviews.
- Keep tourism partner offers in one shared catalog (src/lib/partner-offers.ts) that feeds both the partner directory and the hospital perk menu, so offers published on one side appear on the other.
