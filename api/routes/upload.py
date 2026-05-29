"""文件上传解析 API"""

from fastapi import APIRouter, UploadFile, File
from eduskilk.file_parser import parse_uploaded_file, SUPPORTED_EXTENSIONS

router = APIRouter()


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    text = parse_uploaded_file(file.filename, content)
    return {
        "filename": file.filename,
        "text": text,
        "char_count": len(text),
        "supported_extensions": SUPPORTED_EXTENSIONS,
    }
