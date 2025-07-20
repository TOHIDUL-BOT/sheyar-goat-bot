import sys
import yt_dlp
import json
import os

url = sys.argv[1]
os.makedirs("downloads", exist_ok=True)

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'no_warnings': True,
    # formats info নেবে কিন্তু ডাউনলোড করবে না
}

try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

        # সব ফরম্যাট থেকে শুধু mp4 ভিডিও ফরম্যাটগুলো নেবে
        formats = [
            {
                "format_id": f.get("format_id"),
                "ext": f.get("ext"),
                "format_note": f.get("format_note"),
                "filesize": f.get("filesize"),
                "height": f.get("height"),
                "url": f.get("url")
            }
            for f in info.get("formats", [])
            if f.get("ext") in ["mp4", "m4a", "webm"] and f.get("vcodec") != "none"
        ]

        result = {
            "title": info.get("title"),
            "formats": formats
        }

        print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
