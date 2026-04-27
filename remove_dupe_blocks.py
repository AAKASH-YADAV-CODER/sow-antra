
import os

path = r"c:\Users\GURUNATHAN\OneDrive\Desktop\Sowntra-main\src\features\canvas\components\CanvasElement.jsx"

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 537 (1-based) is index 536
start_idx = 536
# Line 646 (1-based) is index 645. We want to remove up to here.
# So we restart at index 646 (Line 647).
end_idx = 646

print(f"Line {start_idx+1}: {lines[start_idx].strip()}")
print(f"Line {end_idx+1}: {lines[end_idx].strip()}")

if "else if (element.type === 'vector_path')" not in lines[start_idx]:
    print("Error: Start line does not match expected content.")
    exit(1)

if "else if (element.type === 'image')" not in lines[end_idx]:
    print("Error: End line (start of next block) does not match expected content.")
    exit(1)
new_lines = [line for i, line in enumerate(lines) if i < start_idx or i >= end_idx]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully removed lines 537-646.")
