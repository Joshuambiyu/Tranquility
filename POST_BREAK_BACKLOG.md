# Post-Break Backlog

This is the working list for the next implementation phase.

## Priority 1: Core Product + Data

1. User journals persistence
- Confirm whether user-generated journals are saved at user-profile level in the database.
- Verify retrieval flow for previously saved journals.
- Validate that related form submissions are working end-to-end.

2. Daily reflection outcome system
- Return a gentle quote or journaling encouragement after submission.
- Design/implement a lightweight generator strategy for responses.
- Confirm whether a personal reflection page exists.
- If missing, create a personal reflection page.

3. Voices submission model updates
- Voices should support posts like: idea, quote, book read, inspiration.
- Add posting mode: `open` or `anonymous`.
- Add optional descriptor field (example: "Nairobi campus student").
- Ensure these are supported in submission, storage, and display layers.

4. Voice of the Week editorial control
- Ensure Voice of the Week is selected by site owner/admin.
- Voice of the Week can be open or anonymous.

5. Community reflections display rules
- Community reflections can be open or anonymous.
- Include optional descriptor metadata when provided.
- Show open/anonymous flag in UI.

## Priority 2: Content + Admin Workflows

6. Resource of the Month editorial workflow
- Resource of the Month should be updateable monthly.
- Add admin-page capability to manage this content.

7. Featured article naming/content update
- Replace "Featured Reflection of the Week" with "Featured Article".

8. Articles section layout and CTA
- Add "Submit your Article" flow/page improvements.
- In Recent Articles, show two rows before a "See more" CTA.

9. Mission statement revision
- TranquilityHub is a space dedicated to reflection, empathy and mental clarity. Our mission is to encourage thoughtful living by sharing ideas and stories with an aim of improving well-being in a fast-moving technology-driven world.

## Priority 3: UX + Search + Analytics

10. Mindfulness CTA copy
- "Practice Mindfulness" CTA "Explore more" is unclear.
- Replace with clearer action wording.

11. Search experience refinement
- Evaluate redirecting search to a dedicated search page.
- Compare alternatives and pick best UX option.
- Implement refined search behavior.

12. Analytics setup
- Add Google Analytics setup hooks for site visit tracking.
- Keep reporting export-friendly for later Excel-based tracking.

## Priority 4: Motion + Interaction Polish

13. Spring physics interaction
- Add spring-physics behavior to "How TranquilityHub Helps You" section.
- Keep "Daily Reflection" title/section behavior unchanged as requested.

## Suggested Implementation Order

1. Data model and persistence validation (journals + voices).
2. Daily reflection output generator + personal reflection page.
3. Admin editorial tooling (Resource of the Month + Voice of the Week controls).
4. Content naming/layout tasks (Featured Article, Recent Articles two-row + See more).
5. Search routing refinement.
6. Analytics integration.
7. Final motion and microinteraction polish.
