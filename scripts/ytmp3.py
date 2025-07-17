# ytmp3.py
import sys
import yt_dlp

url = sys.argv[1]
output = 'cache/audio.mp3'

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

print(output)
