# extract_audio.py
import sys
import yt_dlp
import json
import os

# লিংক ইনপুট নেয়া হচ্ছে Node.js থেকে
url = sys.argv[1]

# ফোল্ডার যদি না থাকে তবে তৈরি কর
os.makedirs("downloads", exist_ok=True)

# yt-dlp সেটআপ
ydl_opts = {
    'quiet': True,
    'format': 'bestaudio',
    'outtmpl': 'downloads/%(title)s.%(ext)s',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }]
}

try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info).rsplit(".", 1)[0] + ".mp3"
        result = {
            "title": info.get("title", "Unknown Title"),
            "filename": filename
        }
        print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
