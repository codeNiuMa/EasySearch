import json
from pypinyin import lazy_pinyin, Style


def sort_key(name):
    # 返回拼音首字母或英文小写字母，用于排序
    if all('\u4e00' <= ch <= '\u9fff' for ch in name):  # 全是中文
        return ''.join(lazy_pinyin(name, style=Style.FIRST_LETTER))
    else:
        # 混合/英文，拼音优先于 ASCII
        return ''.join(lazy_pinyin(name, style=Style.FIRST_LETTER)) if any(
            '\u4e00' <= ch <= '\u9fff' for ch in name) else name.lower()


def sort_json_keys(filepath_in, filepath_out):
    with open(filepath_in, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sorted_keys = sorted(data.keys(), key=sort_key)
    sorted_data = {key: data[key] for key in sorted_keys}

    with open(filepath_out, 'w', encoding='utf-8') as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=4)


if __name__ == '__main__':
    # 示例用法
    sort_json_keys("engine_config.json", "engine_config.json")
