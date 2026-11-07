# Elsewise comparison UI

Final result: passed

Compared the approved dark variables mockup with the local Chinese variables page at 1487 × 1058, using Python, JavaScript and Go. Checked the light directory and 375 px dark comparison separately.

- The amber nameplate, compact header, fading image, three selected chips and three code columns appear together above the fold. The production view displays the full repository examples, including the Go program wrapper.
- The first browser pass found horizontal page overflow with many languages and an English action tooltip near the right edge. Positioning the card contents and aligning the tooltip inward fixed both. The comparison area scrolls independently at 375 px.
- The first visual pass also showed template indentation before the first source line. The corrected markup starts the code against the same inset in every column.
- Release checks covered both locales, theme and selection persistence, links, keyboard focus, copy, contrast checks for directory text, and the no-JavaScript reading path.
