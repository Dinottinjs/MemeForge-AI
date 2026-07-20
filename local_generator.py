import sys
import json
import time

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        return

    prompt = sys.argv[1]
    gpu_name = sys.argv[2]
    
    # Simulate heavy GPU rendering
    time.sleep(3)
    
    print(json.dumps({
        "success": True,
        "message": f"Lokales Video gerendert mit '{gpu_name}'! (Prompt: {prompt})",
        "video_url": "https://www.w3schools.com/html/mov_bbb.mp4"
    }))

if __name__ == "__main__":
    main()
