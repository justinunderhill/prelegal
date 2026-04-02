from fastapi import APIRouter, HTTPException

from app.services.chat_service import ChatRequest, ChatResponse, process_turn

router = APIRouter(prefix="/api")


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    try:
        return process_turn(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")
