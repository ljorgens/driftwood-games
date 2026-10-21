# Driftwood Games

The website for [Driftwood Games](https://driftwood-games.onrender.com): free strategy games that run in
your browser, with no ads and no sign-ups.

It is a plain static site with no build step. Everything served lives in `public/`.

## Games

| Game | Play | Source |
| --- | --- | --- |
| Tempest Isles | [tempest-isles.onrender.com](https://tempest-isles.onrender.com) | [ljorgens/tempest-isles](https://github.com/ljorgens/tempest-isles) |

## Adding a game

1. Make a folder `public/games/<slug>/` with a short looping `clip.mp4` (silent, under ~1 MB) and a
   `poster.jpg` of its first frame:
   `ffmpeg -i clip.mp4 -vf "select=eq(n\,0)" -frames:v 1 -q:v 4 poster.jpg`
2. In `public/index.html`, copy the `<li class="game">` block and update the text and links.
3. Add the game to the table above, then push. Render redeploys in about a minute.

## Preview locally

```sh
npx serve public
```

## Hosting

`render.yaml` is a Render Blueprint for a free static site named `driftwood-games`. If the service was
created by hand rather than from the Blueprint, changes to its headers must be made in the Render
dashboard.

## License

The site's code is MIT licensed (see `LICENSE`). The fonts are under the SIL Open Font License (see
`public/fonts/`). Each game's clip and poster belong to that game and follow its own license.
