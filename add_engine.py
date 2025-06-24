import json

# 打开并读取原始JSON文件
from EasySearch.jsonsort import sort_json_keys

with open('engine_config.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

name = "高德"
url = "https://ditu.amap.com/search?query="
logo = "gaode"

# 添加新条目 Youtube10
if name and url and logo:
    data[name] = {
        "url": url,
        "icon": f"D:/Code/PythonCode/newlearnProject/EasySearch/icons/{logo}.png"
    }
else:
    print("请输入有效的名称、URL和图标文件名。")
    exit()

# 将更新后的数据写回文件
with open('engine_config.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=4, ensure_ascii=False)

sort_json_keys('engine_config.json', 'engine_config.json')
print(f"新条目 {name} 已成功插入。")
