# MulaLens 3.1.0 Chrome Web Store media

This folder contains five 1280×800 RGB PNG screenshots, a 440×280 RGB PNG small promo tile, a 1400×560 RGB PNG marquee tile, and a 36-second H.264 MP4 walkthrough.

The screenshots are **real browser captures** of the installed extension, fitted without cropping into 1280×800 RGB PNG. They show Deshi Mula Insights, Beton Kemon Insights, TruCareer Insights, Pay & roles, and Ask. The original JPEG captures are in `raw-captures/`. The small tile uses the original light MulaLens artwork; the matching light marquee includes a real Deshi Mula extension capture.

The silent MP4 uses six real browser captures, including the Stories tab. It is a sequence of real UI frames rather than a continuous cursor recording. To populate the Store's global promo video field, upload the MP4 to YouTube and enter its public or unlisted watch URL. No YouTube URL is generated locally.

Regenerate with `python3 store-assets/build_real_store_media.py` from the repository root. The live evidence and host site data may change after these captures.
