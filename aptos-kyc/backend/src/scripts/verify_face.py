import sys
import json
import os
from deepface import DeepFace

def verify(img1_path, img2_path):
    try:
        # Use Facenet model for faster download (90MB vs 580MB) and good accuracy
        result = DeepFace.verify(
            img1_path=img1_path,
            img2_path=img2_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=True
        )
        
        # DeepFace returns a dict with 'verified' (bool) and 'distance' (float)
        # We can also return confidence (1 - distance) roughly, or just the boolean
        return {
            "verified": result["verified"],
            "distance": result["distance"],
            "threshold": result["threshold"],
            "model": result["model"],
            "similarity_metric": result["similarity_metric"]
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: python verify_face.py <img1> <img2>"}))
        sys.exit(1)

    img1 = sys.argv[1]
    img2 = sys.argv[2]

    if not os.path.exists(img1) or not os.path.exists(img2):
        print(json.dumps({"error": "One or more image files not found"}))
        sys.exit(1)

    # Suppress TensorFlow logs
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    
    result = verify(img1, img2)
    print(json.dumps(result))
