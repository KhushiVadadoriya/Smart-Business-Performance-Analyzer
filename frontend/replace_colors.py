import os

target_dir = r"e:\Smart-Business-Performance-Analyzer\frontend\src"

def replace_in_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content = content
    new_content = new_content.replace("bg-white", "bg-[var(--sbpa-card)]")
    new_content = new_content.replace("text-black", "text-[var(--sbpa-dark)]")
    new_content = new_content.replace("border-black", "border-[var(--sbpa-dark)]")
    new_content = new_content.replace("bg-black", "bg-[var(--sbpa-dark)]")
    
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {path}")

for root, _, files in os.walk(target_dir):
    for f in files:
        if f.endswith(".tsx"):
            replace_in_file(os.path.join(root, f))
