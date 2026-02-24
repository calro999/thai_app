import json
import os

base_dir = "/Users/calro/Desktop/タイ語学習アプリ/listening/jlpt_n2"

# 1. Generate study 18-29
for i in range(18, 30):
    quiz_path = os.path.join(base_dir, f"n2_listening_quiz_level{i}.json")
    study_path = os.path.join(base_dir, f"n2_listening_study_level{i}.json")
    
    with open(quiz_path, "r", encoding="utf-8") as f:
        quiz_data = json.load(f)
        
    study_data = {
        "level": i,
        "type": "learning",
        "target_audience": "Thai beginners",
        "data": []
    }
    
    for q in quiz_data["questions"]:
        # find the first non-narrator audio step text
        target_text = ""
        target_role = ""
        for step in q.get("audio_steps", []):
            if step["role"] != "narrator":
                target_text = step["text"]
                target_role = step["role"]
                break
        
        study_data["data"].append({
            "id": q["id"],
            "dialogue": [
                {
                    "role": target_role,
                    "text": target_text
                }
            ],
            "focus_thai_key": "キーワード (Keyword)",
            "thai_explanation": "คำอธิบาย (Explanation)"
        })
        
    with open(study_path, "w", encoding="utf-8") as f:
        json.dump(study_data, f, ensure_ascii=False, indent=4)

# 2. Add titles from `focus_thai_key` of study JSONs to both study and quiz for N2
titles = []
for i in range(1, 31):
    study_path = os.path.join(base_dir, f"n2_listening_study_level{i}.json")
    try:
        with open(study_path, "r", encoding="utf-8") as f:
            study_data = json.load(f)
            
        first_title = study_data["data"][0]["focus_thai_key"].split("（")[0]
        titles.append(first_title)
        
        # update study file
        study_data["title"] = first_title
        with open(study_path, "w", encoding="utf-8") as f:
            json.dump(study_data, f, ensure_ascii=False, indent=4)
            
        # update quiz file
        quiz_path = os.path.join(base_dir, f"n2_listening_quiz_level{i}.json")
        if os.path.exists(quiz_path):
            with open(quiz_path, "r", encoding="utf-8") as f:
                quiz_data = json.load(f)
            quiz_data["title"] = first_title
            with open(quiz_path, "w", encoding="utf-8") as f:
                json.dump(quiz_data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Error on level {i}: {e}")

# write the titles to a text file to update app.js easily
with open(os.path.join(base_dir, "n2_titles.js"), "w", encoding="utf-8") as f:
    f.write("const listeningN2UnitInfo = [\n")
    for i, t in enumerate(titles):
        f.write(f'  {{ title: "{t}" }},\n')
    f.write("];\n")

print("Done generating 18-29 and setting titles.")
