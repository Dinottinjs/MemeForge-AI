import sys
import json
import os
import subprocess

def install_dependencies():
    required = ["torch", "diffusers", "transformers", "accelerate", "torch-directml"]
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
        from diffusers import StableDiffusionPipeline
        
        # Load the model for image generation
        model_id = "runwayml/stable-diffusion-v1-5"
        
        device = get_device()
        is_dml = str(device).startswith("privateuseone")
        
        dtype = torch.float16 if device == "cuda" else torch.float32
        variant = "fp16" if device == "cuda" else None
        
        pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=dtype, variant=variant)
        pipe = pipe.to(device)
        
        if device == "cuda":
            pipe.enable_model_cpu_offload()
            pipe.enable_attention_slicing()
        elif is_dml:
            pipe.enable_attention_slicing()
            
        # Meme style prompt suffix
        meme_prompt = f"{prompt}, high quality, meme style, funny, clear subject"
        
        # Generate image
        image = pipe(meme_prompt, num_inference_steps=20).images[0]
        
        # Save image
        output_dir = os.path.join(os.path.dirname(__file__), "dist", "images")
        os.makedirs(output_dir, exist_ok=True)
        
        import time
        filename = f"meme_{int(time.time())}_{abs(hash(prompt))}.png"
        output_path = os.path.join(output_dir, filename)
        
        image.save(output_path)
        
        print(json.dumps({
            "success": True,
            "message": f"WOW! Viral Meme gerendert mit lokaler GPU ({gpu_name})!",
            "image_url": f"file:///{output_path.replace(os.sep, '/')}"
        }))
    except Exception as e:
        print(json.dumps({"error": f"Fehler bei lokaler Generierung: {str(e)}"}))

if __name__ == "__main__":
    main()
