"""
Core background removal service using rembg + Pillow.
The model session is pre-loaded at module import to avoid per-request cold start.
"""
import io
from rembg import remove, new_session
from PIL import Image

# Pre-load the IS-Net model once at startup.
# Falls back automatically to CPU if no GPU/CUDA is available.
print("[processor] Loading isnet-general-use model...")
_SESSION = new_session("isnet-general-use")
print("[processor] Model ready.")


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex string (e.g. #FFFFFF) to RGB tuple."""
    # Clean the input
    hex_color = hex_color.strip().lstrip("#").lower()
    
    if len(hex_color) == 3:
        hex_color = "".join([c*2 for c in hex_color])
    
    if len(hex_color) != 6:
        raise ValueError(f"Invalid hex color format: {hex_color}")
        
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def remove_background(image_bytes: bytes, bg_color: str = "#FFFFFF") -> bytes:
    """
    Remove image background and replace with specified color or stay transparent.
    """
    print(f"[processor] Processing with bg_color: '{bg_color}'")
    
    # Step 1: Run rembg inference
    output_bytes = remove(image_bytes, session=_SESSION)

    # Handle transparency
    if bg_color.lower() == "transparent":
        print("[processor] Transparency requested, returning raw RGBA.")
        return output_bytes

    # If a specific color is requested, we composite it
    return apply_background(output_bytes, bg_color)


def apply_background(image_bytes: bytes, bg_color: str) -> bytes:
    """
    Composite a transparent RGBA image onto a solid background color.
    """
    print(f"[processor] Applying bg_color: '{bg_color}'")
    
    # Step 1: Open as RGBA
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # Step 2: Parse color
    try:
        rgb = hex_to_rgb(bg_color)
        print(f"[processor] Parsed RGB: {rgb}")
    except Exception as e:
        print(f"[processor] Color parse failed for '{bg_color}': {str(e)}. Falling back to white.")
        rgb = (255, 255, 255)

    # Step 3: Create canvas
    canvas = Image.new("RGBA", img.size, (*rgb, 255))

    # Step 4: Paste foreground using its alpha channel
    canvas.paste(img, mask=img.split()[3])

    # Step 5: Convert and export
    result = canvas.convert("RGB")
    buf = io.BytesIO()
    result.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf.getvalue()
