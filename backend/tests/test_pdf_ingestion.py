from fastapi.testclient import TestClient

from app.main import app


def build_text_pdf(text: str) -> bytes:
    escaped_text = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        f"<< /Length {len(f'BT /F1 18 Tf 72 720 Td ({escaped_text}) Tj ET'.encode())} >>\nstream\nBT /F1 18 Tf 72 720 Td ({escaped_text}) Tj ET\nendstream".encode(),
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(f"trailer\n<< /Root 1 0 R /Size {len(objects) + 1} >>\nstartxref\n{xref_offset}\n%%EOF\n".encode())
    return bytes(pdf)


def test_pdf_upload_extracts_text_and_chat_can_answer():
    client = TestClient(app)
    pdf_bytes = build_text_pdf("Mars policy grants 7 rover days for field research.")

    upload_response = client.post(
        "/api/documents/upload-file",
        data={"title": "Mars Field Policy", "space": "Engineering"},
        files={"file": ("mars_policy.pdf", pdf_bytes, "application/pdf")},
    )

    assert upload_response.status_code == 200
    assert upload_response.json()["source_filename"] == "mars_policy.pdf"

    chat_response = client.post(
        "/api/chat/sessions/default/messages",
        json={
            "question": "How many rover days does the Mars policy grant?",
            "top_k": 5,
            "document_id": upload_response.json()["id"],
        },
    )

    assert chat_response.status_code == 200
    assert "7 rover days" in chat_response.json()["answer"]
    assert chat_response.json()["citations"][0]["document_title"] == "Mars Field Policy"


def test_document_scoped_summary_answers_resume_style_question():
    client = TestClient(app)
    pdf_bytes = build_text_pdf("Kamran Ahmad is a full stack developer skilled in React, FastAPI, AWS, Docker, and PostgreSQL.")

    upload_response = client.post(
        "/api/documents/upload-file",
        data={"title": "resume", "space": "Engineering"},
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )

    chat_response = client.post(
        "/api/chat/sessions/default/messages",
        json={"question": "Summarise resume", "top_k": 5, "document_id": upload_response.json()["id"]},
    )

    assert chat_response.status_code == 200
    assert "Kamran Ahmad" in chat_response.json()["answer"]
    assert chat_response.json()["citations"]
