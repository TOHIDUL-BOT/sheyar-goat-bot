import os
import sys
import yt_dlp

url = sys.argv[1]

# Python script এর লোকেশনে cmds/cache ফোল্ডার তৈরি
base_dir = os.path.dirname(os.path.abspath(__file__))  # goat/scripts
target_dir = os.path.join(base_dir, "cmds", "cache")  # goat/scripts/cmds/cache
os.makedirs(target_dir, exist_ok=True)  # ফোল্ডার না থাকলে তৈরি করবে

output = os.path.join(target_dir, "audio.mp3")

ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': output,
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'quiet': True,
    'no_warnings': True,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download([url])

print(output)  # Node.js এই path টা পাবেই
