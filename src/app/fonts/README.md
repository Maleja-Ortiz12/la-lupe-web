# Local fonts

| Font | Current use | Source | License |
| --- | --- | --- | --- |
| Chewy Regular | Bold, rounded main hero title | https://github.com/google/fonts/tree/main/apache/chewy | Apache 2.0, `Chewy-LICENSE.txt` |
| Caveat Brush Regular | Section titles and painted-style button labels | https://github.com/google/fonts/tree/main/ofl/caveatbrush | SIL OFL 1.1, `OFL.txt` |
| Fira Sans Regular/Medium | Body copy and navigation, without condensed letterforms | https://github.com/google/fonts/tree/main/ofl/firasans | SIL OFL 1.1, `FiraSans-LICENSE.txt` |

All active fonts are loaded with `next/font/local`, with CSS variables on the root `html` element. No runtime Google Fonts requests are needed. These choices approximate the supplied concept; they are not claimed to be its original font files.

Fira Sans Condensed files and their license are retained from the earlier design iteration, but are no longer loaded by the layout.
