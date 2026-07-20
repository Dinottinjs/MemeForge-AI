import sys
import json
import os
import subprocess

def install_dependencies():
    required = ["torch", "diffusers", "transformers", "accelerate", "imageio", "opencv-python", "torch-directml"]
    try:
        import torch
        import diffusers
        import transformers
        import accelerate
        import torch_directml
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + required)

def get_device():
    import torch
    if torch.cuda.is_available():
        return "cuda"
    try:
        import torch_directml
        if torch_directml.is_available():
            return torch_directml.device()
    except ImportError:
        pass
    return "cpu"

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        return

    prompt = sys.argv[1]
    gpu_name = sys.argv[2]
    
    try:
        # Auto-install dependencies if missing
        install_dependencies()
        
        import torch
        from diffusers import DiffusionPipeline
        from diffusers.utils import export_to_video
        
        # Load the model
        model_id = "damo-vilab/text-to-video-ms-1.7b"
        
        # Detect CUDA or DirectML (AMD/Intel)
        device = get_device()
        is_dml = str(device).startswith("privateuseone")
        
        # Determine appropriate dtype and variant
        dtype = torch.float16 if device == "cuda" else torch.float32
        variant = "fp16" if device == "cuda" else None
        
        pipe = DiffusionPipeline.from_pretrained(model_id, torch_dtype=dtype, variant=variant)
        pipe = pipe.to(device)
        
        # Optimize memory usage for CUDA
        if device == "cuda":
            pipe.enable_model_cpu_offload()
            pipe.enable_vae_slicing()
        elif is_dml:
            # Basic optimization for DirectML
            pipe.enable_attention_slicing()
            
        # Generate video
        video_frames = pipe(prompt, num_inference_steps=25).frames[0]
        
        # Save video
        output_dir = os.path.join(os.path.dirname(__file__), "dist", "videos")
        os.makedirs(output_dir, exist_ok=True)
        
        import time
        filename = f"gen_{int(time.time())}_{abs(hash(prompt))}.mp4"
        output_path = os.path.join(output_dir, filename)
        
        export_to_video(video_frames, output_path, fps=10)
        
        print(json.dumps({
            "success": True,
            "message": f"WOW! Video gerendert mit lokaler GPU ({gpu_name})!",
            "video_url": f"file:///{output_path.replace(os.sep, '/')}"
        }))
    except Exception as e:
        print(json.dumps({"error": f"Fehler bei lokaler Generierung: {str(e)}"}))

if __name__ == "__main__":
    main()
