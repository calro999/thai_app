import os
import glob
import re

files = glob.glob('listening/jlpt_n3/n3_*_level*.json')

for f in files:
    # Match n3_quiz_level01.json -> n3_quiz_level1.json
    # or n3_study_level01.json -> n3_study_level1.json
    m = re.search(r'(n3_(?:quiz|study)_level)0(\d\.json)', f)
    if m:
        new_name = m.group(1) + m.group(2)
        dir_name = os.path.dirname(f)
        new_path = os.path.join(dir_name, new_name)
        os.rename(f, new_path)
        print(f"Renamed {os.path.basename(f)} to {new_name}")
