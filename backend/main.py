from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="GraphForge API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DataPoint(BaseModel):
    x: float
    y: float


class LineData(BaseModel):
    name: str
    color: str
    data: List[DataPoint]


class GraphRequest(BaseModel):
    lines: List[LineData]
    graph_title: Optional[str] = "My Graph"
    x_label: Optional[str] = "X Axis"
    y_label: Optional[str] = "Y Axis"


class ParseRequest(BaseModel):
    raw_text: str


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "GraphForge API is running"}


@app.post("/api/parse-data")
async def parse_data(request: ParseRequest):
    """
    Parse raw pasted text into X,Y data points.
    Supports: comma, tab, space, semicolon separated values.
    Handles 2000+ rows efficiently.
    """
    raw = request.raw_text.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="No data provided")

    points = []
    errors = []

    lines = raw.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    lines = [l.strip() for l in lines if l.strip()]

    for i, line in enumerate(lines):
        # Skip comment lines
        if line.startswith("#"):
            continue

        parts = None
        for sep in ["\t", ",", ";", " "]:
            split = [p.strip() for p in line.split(sep) if p.strip()]
            if len(split) >= 2:
                parts = split
                break

        if parts is None:
            errors.append(f"Row {i+1}: Cannot parse '{line[:40]}'")
            continue

        try:
            x = float(parts[0].replace(",", "."))
            y = float(parts[1].replace(",", "."))
            points.append({"x": x, "y": y})
        except ValueError:
            errors.append(f"Row {i+1}: Non-numeric value in '{line[:40]}'")

    return {
        "success": True,
        "points": points,
        "parsed_count": len(points),
        "error_count": len(errors),
        "errors": errors[:20],  # return first 20 errors
    }


@app.post("/api/generate-graph-data")
async def generate_graph_data(request: GraphRequest):
    """
    Validate and structure graph data for Chart.js rendering.
    """
    if not request.lines:
        raise HTTPException(status_code=400, detail="No lines provided")

    datasets = []
    for line in request.lines:
        if not line.data:
            continue

        sorted_data = sorted(line.data, key=lambda p: p.x)
        xs = [p.x for p in sorted_data]
        ys = [p.y for p in sorted_data]

        datasets.append({
            "label":       line.name,
            "color":       line.color,
            "points":      [{"x": p.x, "y": p.y} for p in sorted_data],
            "point_count": len(sorted_data),
            "x_min": round(min(xs), 6),
            "x_max": round(max(xs), 6),
            "y_min": round(min(ys), 6),
            "y_max": round(max(ys), 6),
            "y_avg": round(sum(ys) / len(ys), 6),
        })

    if not datasets:
        raise HTTPException(status_code=400, detail="All lines are empty")

    return {
        "success":      True,
        "graph_title":  request.graph_title,
        "x_label":      request.x_label,
        "y_label":      request.y_label,
        "datasets":     datasets,
        "total_lines":  len(datasets),
        "total_points": sum(d["point_count"] for d in datasets),
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
