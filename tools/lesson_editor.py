import os
import json
import tkinter as tk
import customtkinter as ctk
from tkinter import messagebox
import sys

# Ensure we can import from the tools directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from unicode_to_krutidev import unicode_to_krutidev

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class LessonEditorApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("KrutiDev Lesson Editor & Reorder")
        self.geometry("900x650")
        
        self.chapter_data = None
        self.lessons = []
        self.current_selected_index = -1
        
        # --- Top: Load Chapter ---
        self.top_frame = ctk.CTkFrame(self)
        self.top_frame.pack(pady=10, padx=10, fill="x")
        
        ctk.CTkLabel(self.top_frame, text="Chapter Number:").pack(side="left", padx=10)
        self.entry_chap = ctk.CTkEntry(self.top_frame, width=80)
        self.entry_chap.pack(side="left", padx=10)
        
        ctk.CTkButton(self.top_frame, text="Load Chapter", command=self.load_chapter).pack(side="left", padx=10)
        ctk.CTkButton(self.top_frame, text="Save Changes to JSON", command=self.save_json, fg_color="#28a745", hover_color="#218838").pack(side="right", padx=10)
        
        # --- Main Layout ---
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.pack(pady=10, padx=10, fill="both", expand=True)
        
        # Left: Listbox and Reorder
        self.left_frame = ctk.CTkFrame(self.main_frame, width=350)
        self.left_frame.pack(side="left", fill="y", padx=10, pady=10)
        
        ctk.CTkLabel(self.left_frame, text="Lessons (Select to Edit/Move)", font=("Arial", 14, "bold")).pack(pady=5)
        
        # Standard tk listbox for easy selection
        self.listbox = tk.Listbox(self.left_frame, bg="#2b2b2b", fg="white", selectbackground="#1f538d", font=("Arial", 12))
        self.listbox.pack(fill="both", expand=True, padx=5, pady=5)
        self.listbox.bind('<<ListboxSelect>>', self.on_select)
        
        self.reorder_frame = ctk.CTkFrame(self.left_frame, fg_color="transparent")
        self.reorder_frame.pack(pady=5)
        
        ctk.CTkButton(self.reorder_frame, text="Move Up", width=80, command=self.move_up).pack(side="left", padx=5)
        ctk.CTkButton(self.reorder_frame, text="Move Down", width=80, command=self.move_down).pack(side="left", padx=5)
        
        # Right: Editor
        self.right_frame = ctk.CTkFrame(self.main_frame)
        self.right_frame.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        
        ctk.CTkLabel(self.right_frame, text="Edit Selected Lesson", font=("Arial", 16, "bold")).pack(pady=10)
        
        self.lbl_title = ctk.CTkLabel(self.right_frame, text="Lesson Title:")
        self.lbl_title.pack(anchor="w", padx=20)
        self.entry_title = ctk.CTkEntry(self.right_frame, width=400)
        self.entry_title.pack(anchor="w", padx=20, pady=5)
        
        self.lbl_hindi = ctk.CTkLabel(self.right_frame, text="Hindi Text (Paste Unicode Hindi here):")
        self.lbl_hindi.pack(anchor="w", padx=20, pady=(10, 0))
        self.txt_hindi = ctk.CTkTextbox(self.right_frame, width=450, height=200)
        self.txt_hindi.pack(anchor="w", padx=20, pady=5)
        
        ctk.CTkButton(self.right_frame, text="Convert & Update Lesson", command=self.apply_lesson_changes, width=200).pack(pady=20)
        
    def load_chapter(self):
        chap_num = self.entry_chap.get().strip()
        if not chap_num:
            messagebox.showerror("Error", "Enter chapter number")
            return
            
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        target_file = os.path.join(base_dir, "src", "data", "chapters", f"chapter{chap_num}.json")
        
        if not os.path.exists(target_file):
            messagebox.showerror("Error", "File not found: " + target_file)
            return
            
        with open(target_file, "r", encoding="utf-8") as f:
            self.chapter_data = json.load(f)
            
        self.lessons = self.chapter_data.get("lessons", [])
        self.refresh_listbox()
        self.clear_editor()
        messagebox.showinfo("Loaded", f"Loaded {len(self.lessons)} lessons from Chapter {chap_num}.")
        
    def refresh_listbox(self):
        self.listbox.delete(0, tk.END)
        for i, les in enumerate(self.lessons):
            self.listbox.insert(tk.END, f"{i+1}. {les.get('title', 'Untitled')}")
            
    def on_select(self, event):
        selection = self.listbox.curselection()
        if not selection:
            return
        
        self.current_selected_index = selection[0]
        les = self.lessons[self.current_selected_index]
        
        self.entry_title.delete(0, 'end')
        self.entry_title.insert(0, les.get("title", ""))
        
        self.txt_hindi.delete("1.0", tk.END)
        self.txt_hindi.insert("1.0", les.get("textHindi", les.get("text", "")))
        
    def clear_editor(self):
        self.current_selected_index = -1
        self.entry_title.delete(0, 'end')
        self.txt_hindi.delete("1.0", tk.END)
        
    def move_up(self):
        idx = self.current_selected_index
        if idx > 0:
            self.lessons[idx], self.lessons[idx-1] = self.lessons[idx-1], self.lessons[idx]
            self.refresh_listbox()
            self.listbox.selection_set(idx-1)
            self.current_selected_index = idx-1
            
    def move_down(self):
        idx = self.current_selected_index
        if idx >= 0 and idx < len(self.lessons) - 1:
            self.lessons[idx], self.lessons[idx+1] = self.lessons[idx+1], self.lessons[idx]
            self.refresh_listbox()
            self.listbox.selection_set(idx+1)
            self.current_selected_index = idx+1
            
    def apply_lesson_changes(self):
        idx = self.current_selected_index
        if idx < 0 or idx >= len(self.lessons):
            messagebox.showwarning("Warning", "No lesson selected.")
            return
            
        new_title = self.entry_title.get().strip()
        new_hindi = self.txt_hindi.get("1.0", "end-1c").strip()
        
        if not new_title or not new_hindi:
            messagebox.showwarning("Warning", "Title and text cannot be empty.")
            return
            
        # Convert Hindi to Krutidev 010 using our module
        try:
            kruti_text = unicode_to_krutidev(new_hindi)
            
            self.lessons[idx]["title"] = new_title
            self.lessons[idx]["textHindi"] = new_hindi
            self.lessons[idx]["text"] = kruti_text
            
            self.refresh_listbox()
            self.listbox.selection_set(idx)
            messagebox.showinfo("Success", "Lesson updated successfully!\n\n(Don't forget to click 'Save Changes to JSON' when you're done)")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to convert text: {e}")
        
    def save_json(self):
        if not self.chapter_data:
            return
            
        # Automatically update the sequential IDs and Lesson Numbers based on the new order
        chap_id = self.chapter_data.get("chapterId", 1)
        for i, les in enumerate(self.lessons):
            les["lessonNumber"] = i + 1
            les["id"] = f"chap{chap_id}-les{i+1}"
            
        self.chapter_data["lessons"] = self.lessons
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        target_file = os.path.join(base_dir, "src", "data", "chapters", f"chapter{chap_id}.json")
        
        try:
            with open(target_file, "w", encoding="utf-8") as f:
                json.dump(self.chapter_data, f, indent=2, ensure_ascii=False)
            messagebox.showinfo("Saved", f"Changes successfully saved to chapter{chap_id}.json!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save file: {e}")

if __name__ == "__main__":
    app = LessonEditorApp()
    app.mainloop()
