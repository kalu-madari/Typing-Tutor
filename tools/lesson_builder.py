import os
import json
import customtkinter as ctk
from tkinter import messagebox, filedialog
import unicode_to_krutidev

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
        self.lbl_title.grid(row=0, column=0, columnspan=2, pady=10)
        
        self.btn_load_chap = ctk.CTkButton(self.chapter_frame, text="Load Existing Chapter", command=self.load_chapter)
        self.btn_load_chap.grid(row=0, column=2, columnspan=2, padx=10, pady=10, sticky="e")
        
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
        
        self.buttons_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.buttons_frame.pack(pady=5)
        
        self.btn_add_lesson = ctk.CTkButton(self.buttons_frame, text="+ Add Lesson", command=self.add_lesson)
        self.btn_add_lesson.pack(side="left", padx=5)
        
        self.btn_load_txt = ctk.CTkButton(self.buttons_frame, text="Load from TXT", command=self.load_from_txt)
        self.btn_load_txt.pack(side="left", padx=5)
        
        self.btn_save = ctk.CTkButton(self, text="Generate JSON", command=self.save_json, fg_color="#28a745", hover_color="#218838")
        self.btn_save.pack(pady=5)
        
        self.btn_reset = ctk.CTkButton(self, text="Reset Form", command=self.reset_form, fg_color="#dc3545", hover_color="#c82333")
        self.btn_reset.pack(pady=5)
        
        self.btn_delete_chapter = ctk.CTkButton(self, text="Delete Chapter", command=self.delete_chapter, fg_color="#dc3545", hover_color="#c82333")
        self.btn_delete_chapter.pack(pady=5)
        
        # Add first lesson by default
        self.add_lesson()

    def reset_form(self):
        self.entry_chap_num.delete(0, 'end')
        self.entry_chap_name.delete(0, 'end')
        self.entry_wpm.delete(0, 'end')
        self.entry_acc.delete(0, 'end')
        
        for l in self.lessons:
            l["frame"].destroy()
        self.lessons.clear()
        self.add_lesson()

    def load_chapter(self):
        chap_num_str = self.entry_chap_num.get().strip()
        if not chap_num_str:
            messagebox.showerror("Error", "Please enter the Chapter Number to load.")
            return
            
        try:
            chap_num = int(chap_num_str)
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            target_file = os.path.join(base_dir, "src", "data", "chapters", f"chapter{chap_num}.json")
            
            if os.path.exists(target_file):
                with open(target_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Update Chapter Settings
                self.entry_chap_name.delete(0, 'end')
                self.entry_chap_name.insert(0, data.get("chapterTitle", ""))
                
                self.entry_wpm.delete(0, 'end')
                self.entry_wpm.insert(0, str(data.get("goalWpm", 20)))
                
                self.entry_acc.delete(0, 'end')
                self.entry_acc.insert(0, str(data.get("minimumAccuracy", 90)))
                
                # Clear existing lessons
                for l in self.lessons:
                    l["frame"].destroy()
                self.lessons.clear()
                
                # Add loaded lessons
                loaded_count = 0
                for les in data.get("lessons", []):
                    # We expect Hindi text in 'textHindi', fallback to just 'text' if not available
                    hindi_text = les.get("textHindi", les.get("text", ""))
                    self.add_lesson(name=les.get("title", ""), text=hindi_text)
                    loaded_count += 1
                    
                messagebox.showinfo("Success", f"Loaded chapter{chap_num}.json with {loaded_count} lessons.\nYou can now append new lessons below.")
            else:
                messagebox.showwarning("Not Found", f"chapter{chap_num}.json does not exist.")
        except ValueError:
            messagebox.showerror("Error", "Chapter Number must be an integer.")
        except Exception as e:
            messagebox.showerror("Error", f"Could not load chapter: {e}")

    def load_from_txt(self):
        filepath = filedialog.askopenfilename(title="Select TXT File", filetypes=(("Text Files", "*.txt"), ("All Files", "*.*")))
        if not filepath:
            return
            
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                
            import re
            lines = [line.strip() for line in content.split('\n')]
            
            parsed_lessons = []
            current_name = None
            current_data = []
            
            state = "SEARCHING"
            
            for line in lines:
                if re.match(r"^Lesson.*Name$", line, re.IGNORECASE):
                    if current_name is not None:
                        parsed_lessons.append((current_name, "\n".join(current_data).strip()))
                    current_name = ""
                    current_data = []
                    state = "EXPECTING_NAME"
                elif re.match(r"^Lesson.*Data$", line, re.IGNORECASE):
                    state = "EXPECTING_DATA"
                else:
                    if not line or re.match(r"^-+$", line):
                        continue
                    if state == "EXPECTING_NAME":
                        if not current_name:
                            current_name = line
                        else:
                            current_name += " " + line
                    elif state == "EXPECTING_DATA":
                        current_data.append(line)
                        
            if current_name is not None:
                parsed_lessons.append((current_name, "\n".join(current_data).strip()))
                
            if not parsed_lessons:
                messagebox.showwarning("Warning", "Could not find any lessons matching the format:\n'Lesson X Name'\n...\n'Lesson X Data'\n...")
                return
                
            # If the only existing lesson is blank, remove it so we don't start at Lesson 2
            if len(self.lessons) == 1:
                first = self.lessons[0]
                if not first["name"].get().strip() and not first["text"].get("1.0", "end-1c").strip():
                    self.remove_lesson(first)
                    
            count = 0
            for name, data in parsed_lessons:
                self.add_lesson(name=name, text=data)
                count += 1
                
            messagebox.showinfo("Success", f"Loaded {count} lessons from TXT.\n\nThey have been appended to the bottom.")
        except Exception as e:
            messagebox.showerror("Error", f"Could not load TXT: {e}")

    def delete_chapter(self):
        chap_num_str = self.entry_chap_num.get().strip()
        if not chap_num_str:
            messagebox.showerror("Error", "Please enter the Chapter Number to delete.")
            return
            
        try:
            chap_num = int(chap_num_str)
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            target_file = os.path.join(base_dir, "src", "data", "chapters", f"chapter{chap_num}.json")
            
            if os.path.exists(target_file):
                os.remove(target_file)
                messagebox.showinfo("Success", f"Deleted chapter{chap_num}.json")
            else:
                messagebox.showwarning("Not Found", f"chapter{chap_num}.json does not exist.")
        except ValueError:
            messagebox.showerror("Error", "Chapter Number must be an integer.")
        except Exception as e:
            messagebox.showerror("Error", f"Could not delete chapter: {e}")

    def add_lesson(self, name="", text=""):
        lesson_idx = len(self.lessons) + 1
        
        frame = ctk.CTkFrame(self.lessons_frame)
        frame.pack(pady=10, padx=10, fill="x")
        
        lbl_num = ctk.CTkLabel(frame, text=f"Serial Number: {lesson_idx}", font=("Arial", 12, "bold"))
        lbl_num.grid(row=0, column=0, padx=10, pady=10, sticky="w")
        
        lbl_name = ctk.CTkLabel(frame, text="Lesson Name:")
        lbl_name.grid(row=0, column=1, padx=10, pady=10, sticky="e")
        entry_name = ctk.CTkEntry(frame, width=250)
        entry_name.grid(row=0, column=2, padx=10, pady=10, sticky="w")
        if name:
            entry_name.insert(0, name)
        
        lbl_text = ctk.CTkLabel(frame, text="Data (Typing Text):")
        lbl_text.grid(row=1, column=0, padx=10, pady=5, sticky="ne")
        entry_text = ctk.CTkTextbox(frame, width=500, height=80)
        entry_text.grid(row=1, column=1, columnspan=2, padx=10, pady=5, sticky="w")
        if text:
            entry_text.insert("1.0", text)
        
        lesson_data = {
            "frame": frame,
            "serial": lesson_idx,
            "name": entry_name,
            "text": entry_text,
            "lbl_num": lbl_num
        }
        
        btn_remove = ctk.CTkButton(frame, text="Remove", width=60, fg_color="#dc3545", hover_color="#c82333", command=lambda: self.remove_lesson(lesson_data))
        btn_remove.grid(row=0, column=3, padx=10, pady=10, sticky="e")
        
        self.lessons.append(lesson_data)
        
    def remove_lesson(self, lesson_data):
        lesson_data["frame"].destroy()
        self.lessons.remove(lesson_data)
        # Renumber remaining
        for i, l in enumerate(self.lessons):
            l["serial"] = i + 1
            l["lbl_num"].configure(text=f"Serial Number: {l['serial']}")
            
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
                    
                # Convert Unicode Hindi to Kruti Dev 010 keystrokes
                converted_text = unicode_to_krutidev.unicode_to_krutidev(text)
                
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
                    "text": converted_text,
                    "textHindi": text,
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
