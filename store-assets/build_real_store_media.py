"""Export Store artwork and a walkthrough from real Chrome captures."""

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import subprocess
import shutil

ROOT = Path(__file__).resolve().parent / "v3.1.0"
RAW = ROOT / "raw-captures"
SANS = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

screens = [
    ("03-deshimula-insights.jpg", "01-deshimula-insights-1280x800.png"),
    ("05-betonkemon-insights.jpg", "02-betonkemon-insights-1280x800.png"),
    ("06-trucareer-insights.jpg", "03-trucareer-insights-1280x800.png"),
    ("01-deshimula-pay.jpg", "04-pay-and-roles-1280x800.png"),
    ("02-deshimula-ask.jpg", "05-ask-evidence-1280x800.png"),
]

for source, target in screens:
    original = Image.open(RAW / source).convert("RGB")
    # Fit the whole browser image. Cropping clipped the host site's name and
    # company context, which are important to understand the button's place.
    original.thumbnail((1280, 800), Image.Resampling.LANCZOS)
    image = Image.new("RGB", (1280, 800), "#e6eeec")
    image.paste(original, ((1280 - original.width) // 2, (800 - original.height) // 2))
    image.save(ROOT / target, "PNG", optimize=True)

def text(draw, xy, value, size, color="white", serif=False):
    draw.text(xy, value, fill=color, font=ImageFont.truetype(SERIF if serif else SANS, size))

def preview(image, shot, box):
    x, y, w, h = box
    frame = Image.open(ROOT / shot).convert("RGB")
    frame.thumbnail((w, h), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (frame.width + 30, frame.height + 30))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((13, 13, frame.width + 17, frame.height + 17), 12, fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(9))
    image.paste(shadow, (x - 15, y - 15), shadow)
    image.paste(frame, (x, y))

logo = Image.open(ROOT.parent.parent / "apps/extension/extension/media/logo-128.png").convert("RGBA")
shutil.copyfile(ROOT.parent / "small-promo-tile-440x280.png", ROOT / "small-promo-tile-440x280.png")

marquee = Image.new("RGB", (1400, 560), "#f4fbf9")
draw = ImageDraw.Draw(marquee)
for y in range(560):
    t = y / 559
    color = tuple(round(a * (1 - t) + b * t) for a, b in zip((244, 251, 249), (230, 244, 241)))
    draw.line((0, y, 1399, y), fill=color)
draw.ellipse((1150, -188, 1515, 177), fill="#d8eeea")
draw.ellipse((1137, -175, 1485, 173), outline="#b8ddd6", width=3)
draw.ellipse((1050, 395, 1580, 925), fill="#d5ece7")
icon = logo.resize((70, 70), Image.Resampling.LANCZOS)
marquee.paste(icon, (57, 47), icon)
text(draw, (148, 61), "MulaLens", 38, "#0f3234")
text(draw, (59, 223), "Know before you join.", 48, "#0f3234", serif=True)
text(draw, (62, 333), "Company insights  ·  Pay  ·  Stories", 24, "#496668")
preview(marquee, screens[0][1], (755, 95, 610, 390))
marquee.save(ROOT / "marquee-promo-tile-1400x560.png", "PNG", optimize=True)

# The sixth real capture shows the Stories tab. All six appear in the video.
video_frames = [
    "03-deshimula-insights.jpg",
    "05-betonkemon-insights.jpg",
    "06-trucareer-insights.jpg",
    "01-deshimula-pay.jpg",
    "04-deshimula-stories.jpg",
    "02-deshimula-ask.jpg",
]
for index, filename in enumerate(video_frames):
    shot = Image.open(RAW / filename).convert("RGB")
    shot.thumbnail((1280, 800), Image.Resampling.LANCZOS)
    frame = Image.new("RGB", (1280, 800), "#e6eeec")
    frame.paste(shot, ((1280 - shot.width) // 2, (800 - shot.height) // 2))
    frame.save(ROOT / f"video-frame-{index+1:02}.png", "PNG", optimize=True)

manifest = ROOT / "walkthrough-frames.txt"
manifest.write_text("".join(f"file '{ROOT / f'video-frame-{i:02}.png'}'\nduration 6\n" for i in range(1, 7)) + f"file '{ROOT / 'video-frame-06.png'}'\n")
subprocess.run([
    "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
    "-i", str(manifest), "-vf", "fps=24,format=yuv420p", "-c:v", "libx264",
    "-preset", "medium", "-crf", "20", "-t", "36", "-movflags", "+faststart",
    str(ROOT / "MulaLens-3.1.0-real-feature-walkthrough.mp4"),
], check=True)

deliverables = [ROOT / name for _, name in screens]
deliverables += [ROOT / "small-promo-tile-440x280.png", ROOT / "marquee-promo-tile-1400x560.png", ROOT / "MulaLens-3.1.0-real-feature-walkthrough.mp4", ROOT / "README.md"]
with ZipFile(ROOT / "MulaLens-3.1.0-real-store-media.zip", "w", ZIP_DEFLATED) as archive:
    for item in deliverables:
        archive.write(item, item.name)
for index in range(1, 7):
    (ROOT / f"video-frame-{index:02}.png").unlink()
manifest.unlink()
print("Created", len(deliverables), "assets from real browser captures")
