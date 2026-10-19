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

## Security boundaries
- Enforce comment moderation state and ownership in a database trigger for both inserts and updates, so direct API writes cannot bypass moderation.
- Public prayer reads use safe column grants that exclude author identifiers; authenticated ownership is exposed only as the caller's own request IDs through a scoped RPC, preserving anonymous owner deletion.
- Keep database-backed security regression tests in `tests/security_regression.py`; they require separately provisioned admin and student sessions and clean up only their own fixtures.
