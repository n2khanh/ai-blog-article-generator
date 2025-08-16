from urllib.parse import urlparse, parse_qs
def get_video_id(youtube_url):
    parsed_url = urlparse(youtube_url)
    if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
        return parse_qs(parsed_url.query)["v"][0]
    elif parsed_url.hostname == "youtu.be":
        return parsed_url.path[1:]
    return None

a = get_video_id('https://www.youtube.com/watch?v=s-e51yfp7Ow')
print(a)