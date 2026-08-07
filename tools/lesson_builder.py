import os
import json
import customtkinter as ctk
from tkinter import messagebox

# Set appearance mode and color theme
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class LessonBuilderApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("KrutiDev Lesson Builder")
        self.geometry("900x750")
        
        # --- Chapter Details Frame ---
        self.chapter_frame = ctk.CTkFrame(self)
        self.chapter_frame.pack(pady=10, padx=20, fill="x")
        
        self.lbl_title = ctk.CTkLabel(self.chapter_frame, text="Chapter Settings", font=("Arial", 16, "bold"))
        self.lbl_title.grid(row=0, column=0, columnspan=4, pady=10)
        
        self.lbl_chap_num = ctk.CTkLabel(self.chapter_frame, text="Chapter Number:")
        self.lbl_chap_num.grid(row=1, column=0, padx=10, pady=5, sticky="e")
        self.entry_chap_num = ctk.CTkEntry(self.chapter_frame, width=100)
        self.entry_chap_num.grid(row=1, column=1, padx=10, pady=5, sticky="w")
        
        self.lbl_chap_name = ctk.CTkLabel(self.chapter_frame, text="Chapter Name:")
        self.lbl_chap_name.grid(row=1, column=2, padx=10, pady=5, sticky="e")
        self.entry_chap_name = ctk.CTkEntry(self.chapter_frame, width=300)
        self.entry_chap_name.grid(row=1, column=3, padx=10, pady=5, sticky="w")
        
        self.lbl_wpm = ctk.CTkLabel(self.chapter_frame, text="Min WPM:")
        self.lbl_wpm.grid(row=2, column=0, padx=10, pady=5, sticky="e")
        self.entry_wpm = ctk.CTkEntry(self.chapter_frame, width=100)
        self.entry_wpm.grid(row=2, column=1, padx=10, pady=5, sticky="w")
        
        self.lbl_acc = ctk.CTkLabel(self.chapter_frame, text="Min Accuracy (%):")
        self.lbl_acc.grid(row=2, column=2, padx=10, pady=5, sticky="e")
        self.entry_acc = ctk.CTkEntry(self.chapter_frame, width=100)
        self.entry_acc.grid(row=2, column=3, padx=10, pady=5, sticky="w")
        
        # --- Lessons Frame ---
        self.lessons_frame = ctk.CTkScrollableFrame(self, label_text="Lessons")
        self.lessons_frame.pack(pady=10, padx=20, fill="both", expand=True)
        
        self.lessons = []
        
        self.btn_add_lesson = ctk.CTkButton(self, text="+ Add Lesson", command=self.add_lesson)
        self.btn_add_lesson.pack(pady=5)
        
        self.btn_save = ctk.CTkButton(self, text="Generate JSON", command=self.save_json, fg_color="#28a745", hover_color="#218838")
        self.btn_save.pack(pady=15)
        
        # Add first lesson by default
        self.add_lesson()

    def add_lesson(self):
        lesson_idx = len(self.lessons) + 1
        
        frame = ctk.CTkFrame(self.lessons_frame)
        frame.pack(pady=10, padx=10, fill="x")
        
        lbl_num = ctk.CTkLabel(frame, text=f"Serial Number: {lesson_idx}", font=("Arial", 12, "bold"))
        lbl_num.grid(row=0, column=0, padx=10, pady=10, sticky="w")
        
        lbl_name = ctk.CTkLabel(frame, text="Lesson Name:")
        lbl_name.grid(row=0, column=1, padx=10, pady=10, sticky="e")
        entry_name = ctk.CTkEntry(frame, width=250)
        entry_name.grid(row=0, column=2, padx=10, pady=10, sticky="w")
        
        lbl_text = ctk.CTkLabel(frame, text="Data (Typing Text):")
        lbl_text.grid(row=1, column=0, padx=10, pady=5, sticky="ne")
        entry_text = ctk.CTkTextbox(frame, width=500, height=80)
        entry_text.grid(row=1, column=1, columnspan=2, padx=10, pady=5, sticky="w")
        
        self.lessons.append({
            "frame": frame,
            "serial": lesson_idx,
            "name": entry_name,
            "text": entry_text
        })
        
    def save_json(self):
        try:
            chap_num_str = self.entry_chap_num.get().strip()
            if not chap_num_str:
                raise ValueError("Chapter Number is required.")
            chap_num = int(chap_num_str)
                
            chap_name = self.entry_chap_name.get().strip()
            if not chap_name:
                raise ValueError("Chapter Name is required.")
                
            min_wpm_str = self.entry_wpm.get().strip()
            min_wpm = int(min_wpm_str) if min_wpm_str else 20
            
            min_acc_str = self.entry_acc.get().strip()
            min_acc = int(min_acc_str) if min_acc_str else 90
            
            lessons_data = []
            for i, l in enumerate(self.lessons):
                serial = i + 1
                name = l["name"].get().strip()
                text = l["text"].get("1.0", "end-1c").strip()
                
                if not name or not text:
                    raise ValueError(f"Lesson {serial} is missing a name or text.")
                    
                lessons_data.append({
                    "id": f"chap{chap_num}-les{serial}",
                    "chapterId": chap_num,
                    "lessonNumber": serial,
                    "title": name,
                    "description": f"Practice lesson for {name}",
                    "difficulty": 2,
                    "estimatedTimeMinutes": 2,
                    "minAccuracy": min_acc,
                    "targetWpm": min_wpm,
                    "text": text,
                    "type": "practice"
                })
                
            output = {
                "chapterId": chap_num,
                "chapterTitle": chap_name,
                "totalLessons": len(lessons_data),
                "goalWpm": min_wpm,
                "minimumAccuracy": min_acc,
                "lessons": lessons_data
            }
            
            # Ensure directory exists relative to script
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            target_dir = os.path.join(base_dir, "src", "data", "chapters")
            os.makedirs(target_dir, exist_ok=True)
            
            filename = os.path.join(target_dir, f"chapter{chap_num}.json")
            
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
                
            messagebox.showinfo("Success", f"Successfully generated {len(lessons_data)} lessons!\n\nSaved to: src/data/chapters/chapter{chap_num}.json\n\nThe app will automatically load this chapter on next start/refresh!")
        except ValueError as ve:
            messagebox.showerror("Validation Error", str(ve))
        except Exception as e:
            messagebox.showerror("Error", f"An unexpected error occurred:\n{str(e)}")

if __name__ == "__main__":
    app = LessonBuilderApp()
    app.mainloop()
