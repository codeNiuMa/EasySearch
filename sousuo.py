import customtkinter as ctk
import webbrowser
from urllib.parse import quote_plus
from PIL import Image
import json
import os

# 从外部 JSON 文件加载搜索引擎配置
CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'engine_config.json')
LIGHT_MAIN_COLOR = "#ffffff"
LIGHT_SCROLL_COLOR = "#f5f5f5"
LIGHT_BORDER_COLOR = "#d9d9d9"
LIGHT_TEXT_COLOR = "#000000"
LIGHT_BTN_COLOR = "#ffffff"

DARK_MAIN_COLOR = "#000000"
DARK_SCROLL_COLOR = "#3d3d3d"
DARK_BORDER_COLOR = "#5e5e5e"
DARK_TEXT_COLOR = "#ffffff"
DARK_BTN_COLOR = "#000000"


def load_config(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:

            return json.load(f)
    except Exception as e:
        print(f"加载配置失败: {e}")
        return {}


ENGINE_CONFIG = load_config(CONFIG_FILE)


class SearchApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        # 全局样式
        self.right_frame = None
        self.left_frame = None
        self.main_frame = None
        self.mode = "light"
        ctk.set_appearance_mode(self.mode)
        ctk.set_default_color_theme("blue")

        self.title("多搜索引擎直达工具")
        self.geometry("800x600")
        self.resizable(False, False)
        self.configure(fg_color=LIGHT_MAIN_COLOR)

        self.main_frame = ctk.CTkFrame(self, corner_radius=0, fg_color=LIGHT_MAIN_COLOR)
        self.main_frame.pack(fill="both", expand=True)

        # ==============================================================
        # 左侧图标+文字滚动栏
        # ==============================================================
        self.left_frame = ctk.CTkFrame(self.main_frame, width=200, fg_color=LIGHT_MAIN_COLOR)
        self.left_frame.pack(side="left", fill="y", padx=(20, 10), pady=20)
        self.scrollable = ctk.CTkScrollableFrame(self.left_frame, fg_color=LIGHT_SCROLL_COLOR, corner_radius=10)
        self.scrollable.pack(fill="both", expand=True)

        self.selected = "Google"
        self.buttons = {}
        self.images = {}
        # 预加载图标资源
        for engine, cfg in ENGINE_CONFIG.items():
            icon_path = cfg.get("icon")
            if icon_path and os.path.exists(icon_path):
                try:
                    img = Image.open(icon_path)
                    self.images[engine] = ctk.CTkImage(img, size=(24, 24))
                except Exception:
                    self.images[engine] = None
            else:
                self.images[engine] = None

        # 创建按钮，图标+文字并排
        for engine in ENGINE_CONFIG:
            icon = self.images.get(engine)
            btn = ctk.CTkButton(
                self.scrollable,
                height=40,
                border_width=1,
                border_color=LIGHT_BORDER_COLOR,
                text=engine,
                image=icon,
                compound="left",
                font=("微软雅黑", 16),
                fg_color=LIGHT_BTN_COLOR,
                hover_color="#e0e0e0",
                text_color=LIGHT_TEXT_COLOR,
                corner_radius=8,
                anchor="w",
                command=lambda e=engine: self.select_engine(e)
            )
            btn.pack(fill="x", pady=6, padx=6)
            self.buttons[engine] = btn

        # 右侧输入区域 居中显示
        self.right_frame = ctk.CTkFrame(self.main_frame, fg_color=LIGHT_MAIN_COLOR)
        self.right_frame.pack(side="right", fill="both", expand=True, padx=(10, 20), pady=20)
        self.right_frame.grid_rowconfigure(0, weight=1)
        self.right_frame.grid_rowconfigure(4, weight=1)
        self.right_frame.grid_columnconfigure(0, weight=1)

        # 当前选中搜索引擎提示
        self.engine_label = ctk.CTkLabel(
            self.right_frame,
            text="",
            text_color="#555555"
            , width=50, height=50,

        )
        self.engine_label.grid(row=1, column=0, pady=10)

        self.entry = ctk.CTkEntry(
            self.right_frame,
            placeholder_text="输入搜索关键词...",
            width=400,
            height=40,
            font=("微软雅黑", 18),
            fg_color="#ffffff",
            text_color="#000000",
            placeholder_text_color="#888888",
            border_width=2,
            border_color="#cccccc"
        )
        self.entry.grid(row=2, column=0, pady=10)
        self.entry.bind('<Return>', lambda e: self.search())

        self.search_btn = ctk.CTkButton(
            self.right_frame,
            text="搜索",
            font=("微软雅黑", 18),
            width=120,
            height=40,
            fg_color="#0078d7",
            hover_color="#005a9e",
            text_color="#ffffff",
            command=self.search
        )
        self.search_btn.grid(row=3, column=0, pady=10)

        # 默认选中
        if ENGINE_CONFIG:
            first = "Google"
            self.select_engine(first)

        # —— 新增：日夜模式开关 —— 
        # 在 right_frame 中第一行放一个 Switch
        self.mode_switch = ctk.CTkSwitch(
            self.right_frame,
            font=("Segoe UI Emoji", 18),
            text="🌙 ",
            command=self.toggle_mode,
            progress_color="#0078d7",
            fg_color="#cccccc"
        )
        self.mode_switch.grid(row=0, column=0, sticky="ne", padx=20, pady=10)

    def select_engine(self, engine):
        print(f"[INFO]select new engine 🔍{engine}")
        if self.selected:
            self.buttons[self.selected].configure(fg_color="#000000" if self.mode == "dark" else "#ffffff")
        self.selected = engine
        self.buttons[engine].configure(fg_color="#e0e0e0" if self.mode == "light" else "#6b6b6b")
        self.engine_label.configure(image=ctk.CTkImage(Image.open(ENGINE_CONFIG[engine].get("icon")), size=(60, 60)))

    def search(self):
        query = self.entry.get().strip()
        if not query or not self.selected:
            return
        base_url = ENGINE_CONFIG[self.selected].get("url", "")
        if base_url:
            webbrowser.open_new_tab(base_url + quote_plus(query))

    def toggle_mode(self):
        # 1. 翻转 state
        self.mode = "dark" if self.mode == "light" else "light"
        if self.mode == "dark":
            # 主界面切换到暗色模式
            self.configure(fg_color=DARK_MAIN_COLOR)
            self.main_frame.configure(fg_color=DARK_MAIN_COLOR)
            # 左边栏、滚动栏、按钮、字体切换到暗色模式
            self.left_frame.configure(fg_color=DARK_MAIN_COLOR)
            self.scrollable.configure(fg_color=DARK_SCROLL_COLOR)
            for btn in self.buttons.values():
                btn.configure(fg_color=DARK_BTN_COLOR,
                              text_color=DARK_TEXT_COLOR,
                              border_color=DARK_BORDER_COLOR, )
            # 右边栏、字体切换到暗色模式
            self.right_frame.configure(fg_color=DARK_MAIN_COLOR)
        else:
            # 主界面切换到light色模式
            self.configure(fg_color=LIGHT_MAIN_COLOR)
            self.main_frame.configure(fg_color=LIGHT_MAIN_COLOR)
            # 左边栏、滚动栏、按钮、字体切换到暗色模式
            self.left_frame.configure(fg_color=LIGHT_MAIN_COLOR)
            self.scrollable.configure(fg_color=LIGHT_SCROLL_COLOR)
            for btn in self.buttons.values():
                btn.configure(fg_color=LIGHT_BTN_COLOR,
                              text_color=LIGHT_TEXT_COLOR,
                              border_color=LIGHT_BTN_COLOR, )
            # 右边栏、字体切换到暗色模式
            self.right_frame.configure(fg_color=LIGHT_MAIN_COLOR)

        # 2. 应用到全局
        ctk.set_appearance_mode(self.mode)

        # 3. 更新开关显示文字（可选）
        if self.mode == "dark":
            self.mode_switch.configure(text="🌙")
        else:
            self.mode_switch.configure(text="🌞")

if __name__ == '__main__':
    # 首次运行时请确保 engine_config.json 与代码同目录
    app = SearchApp()
    app.mainloop()
