import os
import json
import tkinter as tk
import customtkinter as ctk
from tkinter import messagebox
import shutil
import re

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class ChapterReorderApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("KrutiDev Chapter Reorder Tool")
        self.geometry("600x500")
        
        self.chapters = []
        self.current_selected_index = -1
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.chapters_dir = os.path.join(self.base_dir, "src", "data", "chapters")
        
        # --- Top Layout ---
        self.top_frame = ctk.CTkFrame(self)
        self.top_frame.pack(pady=10, padx=10, fill="x")
        
        ctk.CTkLabel(self.top_frame, text="Reorder Chapters", font=("Arial", 16, "bold")).pack(pady=5)
        
        # --- Main Layout ---
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.pack(pady=10, padx=10, fill="both", expand=True)
        
        self.listbox = tk.Listbox(self.main_frame, bg="#2b2b2b", fg="white", selectbackground="#1f538d", font=("Arial", 12))
        self.listbox.pack(fill="both", expand=True, padx=10, pady=10)
        self.listbox.bind('<<ListboxSelect>>', self.on_select)
        
        self.reorder_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.reorder_frame.pack(pady=5)
        
        ctk.CTkButton(self.reorder_frame, text="Move Up", width=100, command=self.move_up).pack(side="left", padx=10)
        ctk.CTkButton(self.reorder_frame, text="Move Down", width=100, command=self.move_down).pack(side="left", padx=10)
        
        # --- Bottom Layout ---
        self.bottom_frame = ctk.CTkFrame(self)
        self.bottom_frame.pack(pady=10, padx=10, fill="x")
        
        ctk.CTkButton(self.bottom_frame, text="Reload Chapters", command=self.load_chapters).pack(side="left", padx=10)
        ctk.CTkButton(self.bottom_frame, text="Save New Order", command=self.save_chapters, fg_color="#28a745", hover_color="#218838").pack(side="right", padx=10)
        
        self.load_chapters()
        
    def load_chapters(self):
        self.chapters = []
        if not os.path.exists(self.chapters_dir):
            messagebox.showerror("Error", f"Chapters directory not found: {self.chapters_dir}")
            return
            
        for file in os.listdir(self.chapters_dir):
            if file.startswith("chapter") and file.endswith(".json"):
                match = re.search(r'chapter(\d+)\.json', file)
                if match:
                    chap_num = int(match.group(1))
                    file_path = os.path.join(self.chapters_dir, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    # Some files are list of lessons directly, some have {"chapterId": 1, "lessons": []}
                    if isinstance(data, list):
                        lessons = data
                        title = lessons[0].get("title", "Unknown") if lessons else "Empty Chapter"
                    else:
                        lessons = data.get("lessons", [])
                        title = data.get("title", data.get("chapterTitle", lessons[0].get("title", "Unknown") if lessons else "Empty Chapter"))
                        
                    self.chapters.append({
                        "original_num": chap_num,
                        "file_path": file_path,
                        "data": data,
                        "title": title
                    })
                    
        self.chapters.sort(key=lambda x: x["original_num"])
        self.refresh_listbox()
        
    def refresh_listbox(self):
        self.listbox.delete(0, tk.END)
        for i, chap in enumerate(self.chapters):
            self.listbox.insert(tk.END, f"Chapter {i+1} (was {chap['original_num']}): {chap['title']}")
            
    def on_select(self, event):
        selection = self.listbox.curselection()
        if selection:
            self.current_selected_index = selection[0]
            
    def move_up(self):
        idx = self.current_selected_index
        if idx > 0:
            self.chapters[idx], self.chapters[idx-1] = self.chapters[idx-1], self.chapters[idx]
            self.refresh_listbox()
            self.listbox.selection_set(idx-1)
            self.current_selected_index = idx-1
            
    def move_down(self):
        idx = self.current_selected_index
        if idx >= 0 and idx < len(self.chapters) - 1:
            self.chapters[idx], self.chapters[idx+1] = self.chapters[idx+1], self.chapters[idx]
            self.refresh_listbox()
            self.listbox.selection_set(idx+1)
            self.current_selected_index = idx+1
            
    def save_chapters(self):
        if not self.chapters:
            return
            
        confirm = messagebox.askyesno("Confirm Save", "This will rename the chapter files and update internal IDs. Proceed?")
        if not confirm:
            return
            
        # First, rename all files to temporary names to avoid collisions
        temp_files = []
        for i, chap in enumerate(self.chapters):
            temp_path = os.path.join(self.chapters_dir, f"temp_chap_{i}.json")
            os.rename(chap["file_path"], temp_path)
            temp_files.append((chap, temp_path, i + 1))
            
        # Now write them back with correct names and updated data
        for chap, temp_path, new_num in temp_files:
            new_path = os.path.join(self.chapters_dir, f"chapter{new_num}.json")
            data = chap["data"]
            
            if isinstance(data, list):
                for j, les in enumerate(data):
                    les["chapterId"] = new_num
                    les["id"] = f"chap{new_num}-les{j+1}"
            else:
                data["chapterId"] = new_num
                if "lessons" in data:
                    for j, les in enumerate(data["lessons"]):
                        les["chapterId"] = new_num
                        les["id"] = f"chap{new_num}-les{j+1}"
                        
            with open(new_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            os.remove(temp_path)
            chap["file_path"] = new_path
            chap["original_num"] = new_num
            
        messagebox.showinfo("Success", "Chapters reordered and IDs updated successfully!")
        self.load_chapters()

if __name__ == "__main__":
    app = ChapterReorderApp()
    app.mainloop()
