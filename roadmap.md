# Current scope

- [x] Prevent student self-approval and moderation-status spoofing in lesson comments; actual student, admin and temporary moderator database writes passed.
- [x] Hide prayer author identifiers from public readers while preserving anonymous display and owner deletion; direct reads and signed-in/public browser flows passed.
- P3, prayer-counter hardening and audit atomicity remain outside this approved correction.
- [ ] Test the full password-recovery flow with a disposable account: register, request recovery link, invalid/expired link states, set new password, sign in with it; clean up the test account.