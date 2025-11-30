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
            enforce_detection=False
        )
        
        # Custom Threshold Logic for ID vs Selfie (Standard 0.4 is too strict)
        # We'll use a more lenient threshold of 0.85 for this MVP/Demo
        custom_threshold = 0.85
        distance = result["distance"]
        
        if distance <= custom_threshold:
            result["verified"] = True
        else:
            result["verified"] = False
            
        result["threshold"] = custom_threshold
        
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

    # Debug: Check file sizes
    size1 = os.path.getsize(img1)
    size2 = os.path.getsize(img2)
    if size1 == 0 or size2 == 0:
        print(json.dumps({"error": f"One or more image files are empty. Img1: {size1} bytes, Img2: {size2} bytes"}))
        sys.exit(1)

    # Debug: Try reading with cv2 to ensure validity
    import cv2
    try:
        test_img1 = cv2.imread(img1)
        test_img2 = cv2.imread(img2)
        if test_img1 is None:
             print(json.dumps({"error": f"OpenCV could not read img1 at {img1}"}))
             sys.exit(1)
        if test_img2 is None:
             print(json.dumps({"error": f"OpenCV could not read img2 at {img2}"}))
             sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"OpenCV read error: {str(e)}"}))
        sys.exit(1)

    # Suppress TensorFlow logs
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    
    result = verify(img1, img2)
    print(json.dumps(result))
