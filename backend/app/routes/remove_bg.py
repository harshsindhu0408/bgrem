"""
API routes for background removal — single image and bulk processing.
"""
import io
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse, JSONResponse
from app.services.processor import remove_background, apply_background

router = APIRouter()

# Thread pool for CPU-bound rembg processing (keeps event loop unblocked)
_EXECUTOR = ThreadPoolExecutor(max_workers=4)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


def _validate_file(file: UploadFile, content: bytes) -> None:
    """Raise HTTPException if the file doesn't pass validation."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Only JPG and PNG are accepted.",
        )
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File '{file.filename}' exceeds the 15MB size limit.",
        )


@router.post("/remove-bg", summary="Remove background from a single image")
async def remove_bg_single(
    file: UploadFile = File(...),
    bg_color: str = Form("#FFFFFF")
):
    """
    Accept a single JPG or PNG, remove its background, replace with specifies color, 
    and return the processed image.
    """
    content = await file.read()
    _validate_file(file, content)

    loop = asyncio.get_event_loop()
    try:
        processed = await loop.run_in_executor(_EXECUTOR, remove_background, content, bg_color)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(exc)}")

    original_stem = file.filename.rsplit(".", 1)[0]
    download_name = f"{original_stem}_{bg_color.replace('#', '')}.png"

    return StreamingResponse(
        io.BytesIO(processed),
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
    )


@router.post("/apply-bg", summary="Apply a background color to a transparent image")
async def apply_bg_route(
    file: UploadFile = File(...),
    bg_color: str = Form("#FFFFFF")
):
    """
    Accept a transparent PNG and a background color.
    Composite them and return the result.
    """
    content = await file.read()
    
    loop = asyncio.get_event_loop()
    try:
        processed = await loop.run_in_executor(_EXECUTOR, apply_background, content, bg_color)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Application failed: {str(exc)}")

    original_stem = file.filename.rsplit(".", 1)[0]
    download_name = f"{original_stem}_{bg_color.replace('#', '')}.png"

    return StreamingResponse(
        io.BytesIO(processed),
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
    )


@router.post("/remove-bg/bulk", summary="Remove backgrounds from multiple images")
async def remove_bg_bulk(
    files: list[UploadFile] = File(...),
    bg_color: str = Form("#FFFFFF")
):
    """
    Accept multiple images and a background color.
    """
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 files per bulk request.")

    # Read all file contents first
    file_contents = []
    for f in files:
        content = await f.read()
        file_contents.append((f.filename, f.content_type, content))

    # Process all images in the thread pool concurrently
    loop = asyncio.get_event_loop()

    async def process_one(filename: str, content_type: str, content: bytes) -> dict:
        try:
            mock_file = type("F", (), {"filename": filename, "content_type": content_type})()
            _validate_file(mock_file, content)
            processed = await loop.run_in_executor(_EXECUTOR, remove_background, content, bg_color)
            import base64
            b64 = base64.b64encode(processed).decode()
            stem = filename.rsplit(".", 1)[0]
            return {
                "filename": filename,
                "output_filename": f"{stem}_{bg_color.replace('#', '')}.png",
                "status": "success",
                "data_url": f"data:image/png;base64,{b64}",
            }
        except HTTPException as e:
            return {"filename": filename, "status": "error", "error": e.detail}
        except Exception as e:
            return {"filename": filename, "status": "error", "error": str(e)}

    tasks = [process_one(fn, ct, c) for fn, ct, c in file_contents]
    results = await asyncio.gather(*tasks)

    return JSONResponse(content={"results": results})
