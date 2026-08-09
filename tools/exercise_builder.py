import os
import json
import re
import customtkinter as ctk
from tkinter import messagebox, filedialog
import unicode_to_krutidev

# Set appearance mode and color theme
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class ExerciseBuilderApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("KrutiDev Practice Exercise Builder")
        self.geometry("960x800")

        # --- Exercise Set Details Frame ---
        self.set_frame = ctk.CTkFrame(self)
        self.set_frame.pack(pady=10, padx=20, fill="x")

        self.lbl_title = ctk.CTkLabel(self.set_frame, text="Exercise Set Settings", font=("Arial", 16, "bold"))
        self.lbl_title.grid(row=0, column=0, columnspan=2, pady=10)

        self.btn_load_set = ctk.CTkButton(self.set_frame, text="Load Existing Set", command=self.load_exercise_set)
        self.btn_load_set.grid(row=0, column=2, columnspan=2, padx=10, pady=10, sticky="e")

        # Set ID (used as filename, e.g. "raj-ia-2024")
        self.lbl_set_id = ctk.CTkLabel(self.set_frame, text="Set ID (filename):")
        self.lbl_set_id.grid(row=1, column=0, padx=10, pady=5, sticky="e")
        self.entry_set_id = ctk.CTkEntry(self.set_frame, width=200, placeholder_text="e.g. raj-ia-2024")
        self.entry_set_id.grid(row=1, column=1, padx=10, pady=5, sticky="w")

        # Set Name (display name in the app)
        self.lbl_set_name = ctk.CTkLabel(self.set_frame, text="Set Name (display):")
        self.lbl_set_name.grid(row=1, column=2, padx=10, pady=5, sticky="e")
        self.entry_set_name = ctk.CTkEntry(self.set_frame, width=320, placeholder_text="e.g. Rajasthan IA Exam 2024")
        self.entry_set_name.grid(row=1, column=3, padx=10, pady=5, sticky="w")

        # Min WPM
        self.lbl_wpm = ctk.CTkLabel(self.set_frame, text="Min WPM:")
        self.lbl_wpm.grid(row=2, column=0, padx=10, pady=5, sticky="e")
        self.entry_wpm = ctk.CTkEntry(self.set_frame, width=100)
        self.entry_wpm.grid(row=2, column=1, padx=10, pady=5, sticky="w")
        self.entry_wpm.insert(0, "60")

        # Min Accuracy
        self.lbl_acc = ctk.CTkLabel(self.set_frame, text="Min Accuracy (%):")
        self.lbl_acc.grid(row=2, column=2, padx=10, pady=5, sticky="e")
        self.entry_acc = ctk.CTkEntry(self.set_frame, width=100)
        self.entry_acc.grid(row=2, column=3, padx=10, pady=5, sticky="w")
        self.entry_acc.insert(0, "95")

        # Time Limit (minutes)
        self.lbl_time = ctk.CTkLabel(self.set_frame, text="Time Limit (minutes):")
        self.lbl_time.grid(row=3, column=0, padx=10, pady=5, sticky="e")
        self.entry_time = ctk.CTkEntry(self.set_frame, width=100)
        self.entry_time.grid(row=3, column=1, padx=10, pady=5, sticky="w")
        self.entry_time.insert(0, "10")

        # Difficulty
        self.lbl_diff = ctk.CTkLabel(self.set_frame, text="Difficulty:")
        self.lbl_diff.grid(row=3, column=2, padx=10, pady=5, sticky="e")
        self.diff_var = ctk.StringVar(value="intermediate")
        self.diff_menu = ctk.CTkOptionMenu(self.set_frame, values=["beginner", "intermediate", "advanced", "expert"], variable=self.diff_var)
        self.diff_menu.grid(row=3, column=3, padx=10, pady=5, sticky="w")

        # Max Marks
        self.lbl_max_marks = ctk.CTkLabel(self.set_frame, text="Max Marks:")
        self.lbl_max_marks.grid(row=4, column=0, padx=10, pady=5, sticky="e")
        self.entry_max_marks = ctk.CTkEntry(self.set_frame, width=100)
        self.entry_max_marks.grid(row=4, column=1, padx=10, pady=5, sticky="w")
        self.entry_max_marks.insert(0, "25")

        # Passing Marks
        self.lbl_passing_marks = ctk.CTkLabel(self.set_frame, text="Passing Marks:")
        self.lbl_passing_marks.grid(row=4, column=2, padx=10, pady=5, sticky="e")
        self.entry_passing_marks = ctk.CTkEntry(self.set_frame, width=100)
        self.entry_passing_marks.grid(row=4, column=3, padx=10, pady=5, sticky="w")
        self.entry_passing_marks.insert(0, "10")

        # --- Exercises Scrollable Frame ---
        self.exercises_frame = ctk.CTkScrollableFrame(self, label_text="Exercises")
        self.exercises_frame.pack(pady=10, padx=20, fill="both", expand=True)

        self.exercises = []

        # --- Action Buttons ---
        self.buttons_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.buttons_frame.pack(pady=5)

        self.btn_add = ctk.CTkButton(self.buttons_frame, text="+ Add Exercise", command=self.add_exercise)
        self.btn_add.pack(side="left", padx=5)

        self.btn_load_txt = ctk.CTkButton(self.buttons_frame, text="Load from TXT", command=self.load_from_txt)
        self.btn_load_txt.pack(side="left", padx=5)

        self.btn_save = ctk.CTkButton(self, text="Generate JSON", command=self.save_json,
                                       fg_color="#28a745", hover_color="#218838")
        self.btn_save.pack(pady=5)

        self.btn_reset = ctk.CTkButton(self, text="Reset Form", command=self.reset_form,
                                        fg_color="#dc3545", hover_color="#c82333")
        self.btn_reset.pack(pady=5)

        # Add first exercise by default
        self.add_exercise()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _get_output_dir(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        out_dir = os.path.join(base_dir, "src", "data", "exercises")
        os.makedirs(out_dir, exist_ok=True)
        return out_dir

    # ------------------------------------------------------------------
    # Load existing set
    # ------------------------------------------------------------------

    def load_exercise_set(self):
        set_id = self.entry_set_id.get().strip()
        if not set_id:
            messagebox.showerror("Error", "Please enter the Set ID to load.")
            return

        target_file = os.path.join(self._get_output_dir(), f"{set_id}.json")
        if not os.path.exists(target_file):
            messagebox.showwarning("Not Found", f"{set_id}.json does not exist.")
            return

        try:
            with open(target_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.entry_set_name.delete(0, "end")
            self.entry_set_name.insert(0, data.get("setName", ""))

            self.entry_wpm.delete(0, "end")
            self.entry_wpm.insert(0, str(data.get("minWpm", 60)))

            self.entry_acc.delete(0, "end")
            self.entry_acc.insert(0, str(data.get("minAccuracy", 95)))

            self.entry_time.delete(0, "end")
            self.entry_time.insert(0, str(data.get("timeLimitMinutes", 10)))

            self.diff_var.set(data.get("difficulty", "intermediate"))

            self.entry_max_marks.delete(0, "end")
            self.entry_max_marks.insert(0, str(data.get("maxMarks", 20)))

            self.entry_passing_marks.delete(0, "end")
            self.entry_passing_marks.insert(0, str(data.get("passingMarks", 10)))

            for ex in self.exercises:
                ex["frame"].destroy()
            self.exercises.clear()

            loaded = 0
            for ex in data.get("exercises", []):
                hindi = ex.get("textHindi", ex.get("text", ""))
                self.add_exercise(name=ex.get("title", ""), text=hindi)
                loaded += 1

            messagebox.showinfo("Success", f"Loaded {set_id}.json with {loaded} exercises.")
        except Exception as e:
            messagebox.showerror("Error", f"Could not load set: {e}")

    # ------------------------------------------------------------------
    # Load from TXT  (same format as lesson_builder: Lesson N Name / Lesson N Data)
    # ------------------------------------------------------------------

    def load_from_txt(self):
        filepath = filedialog.askopenfilename(
            title="Select TXT File",
            filetypes=[("Text Files", "*.txt"), ("All Files", "*.*")]
        )
        if not filepath:
            return

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            lines = [line.strip() for line in content.split("\n")]

            parsed = []
            current_name = None
            current_data = []
            state = "SEARCHING"

            for line in lines:
                if re.match(r"^Lesson.*Name$", line, re.IGNORECASE):
                    if current_name is not None:
                        parsed.append((current_name, "\n".join(current_data).strip()))
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
                parsed.append((current_name, "\n".join(current_data).strip()))

            if not parsed:
                messagebox.showwarning(
                    "Warning",
                    "No exercises found.\n\nExpected format:\n"
                    "  Lesson N Name\n  <Name Here>\n  Lesson N Data\n  <Text Here>"
                )
                return

            # Remove blank default exercise
            if len(self.exercises) == 1:
                first = self.exercises[0]
                if not first["name"].get().strip() and not first["text"].get("1.0", "end-1c").strip():
                    self.remove_exercise(first)

            for name, data in parsed:
                self.add_exercise(name=name, text=data)

            messagebox.showinfo("Success", f"Loaded {len(parsed)} exercises from TXT.")
        except Exception as e:
            messagebox.showerror("Error", f"Could not load TXT: {e}")

    # ------------------------------------------------------------------
    # Add / Remove exercise row
    # ------------------------------------------------------------------

    def add_exercise(self, name="", text=""):
        idx = len(self.exercises) + 1

        frame = ctk.CTkFrame(self.exercises_frame)
        frame.pack(pady=10, padx=10, fill="x")

        lbl_num = ctk.CTkLabel(frame, text=f"Exercise #{idx}", font=("Arial", 12, "bold"))
        lbl_num.grid(row=0, column=0, padx=10, pady=10, sticky="w")

        lbl_name = ctk.CTkLabel(frame, text="Title:")
        lbl_name.grid(row=0, column=1, padx=10, pady=10, sticky="e")
        entry_name = ctk.CTkEntry(frame, width=300, placeholder_text="e.g. Artificial Intelligence")
        entry_name.grid(row=0, column=2, padx=10, pady=10, sticky="w")
        if name:
            entry_name.insert(0, name)

        lbl_text = ctk.CTkLabel(frame, text="Hindi Text:")
        lbl_text.grid(row=1, column=0, padx=10, pady=5, sticky="ne")
        entry_text = ctk.CTkTextbox(frame, width=560, height=100)
        entry_text.grid(row=1, column=1, columnspan=2, padx=10, pady=5, sticky="w")
        if text:
            entry_text.insert("1.0", text)

        ex_data = {
            "frame": frame,
            "serial": idx,
            "name": entry_name,
            "text": entry_text,
            "lbl_num": lbl_num,
        }

        btn_remove = ctk.CTkButton(
            frame, text="Remove", width=70,
            fg_color="#dc3545", hover_color="#c82333",
            command=lambda: self.remove_exercise(ex_data)
        )
        btn_remove.grid(row=0, column=3, padx=10, pady=10, sticky="e")

        self.exercises.append(ex_data)

    def remove_exercise(self, ex_data):
        ex_data["frame"].destroy()
        self.exercises.remove(ex_data)
        for i, ex in enumerate(self.exercises):
            ex["serial"] = i + 1
            ex["lbl_num"].configure(text=f"Exercise #{ex['serial']}")

    # ------------------------------------------------------------------
    # Reset
    # ------------------------------------------------------------------

    def reset_form(self):
        self.entry_set_id.delete(0, "end")
        self.entry_set_name.delete(0, "end")
        self.entry_wpm.delete(0, "end")
        self.entry_wpm.insert(0, "60")
        self.entry_acc.delete(0, "end")
        self.entry_acc.insert(0, "95")
        self.entry_time.delete(0, "end")
        self.entry_time.insert(0, "10")
        self.diff_var.set("intermediate")
        self.entry_max_marks.delete(0, "end")
        self.entry_max_marks.insert(0, "25")
        self.entry_passing_marks.delete(0, "end")
        self.entry_passing_marks.insert(0, "10")

        for ex in self.exercises:
            ex["frame"].destroy()
        self.exercises.clear()
        self.add_exercise()

    # ------------------------------------------------------------------
    # Save / Generate JSON
    # ------------------------------------------------------------------

    def save_json(self):
        try:
            set_id = self.entry_set_id.get().strip()
            if not set_id:
                raise ValueError("Set ID is required (used as filename).")
            if not re.match(r"^[a-zA-Z0-9_\-]+$", set_id):
                raise ValueError("Set ID must contain only letters, numbers, hyphens, or underscores.")

            set_name = self.entry_set_name.get().strip()
            if not set_name:
                raise ValueError("Set Name (display) is required.")

            min_wpm     = int(self.entry_wpm.get().strip() or 60)
            min_acc     = int(self.entry_acc.get().strip() or 95)
            time_limit  = int(self.entry_time.get().strip() or 10)
            difficulty  = self.diff_var.get()
            max_marks     = int(self.entry_max_marks.get().strip() or 20)
            passing_marks = int(self.entry_passing_marks.get().strip() or 10)
            if passing_marks > max_marks:
                raise ValueError("Passing Marks cannot be greater than Max Marks.")

            exercises_data = []
            for i, ex in enumerate(self.exercises):
                serial = i + 1
                name = ex["name"].get().strip()
                text = ex["text"].get("1.0", "end-1c").strip()

                if not name or not text:
                    raise ValueError(f"Exercise #{serial} is missing a title or text.")

                # Convert Unicode Hindi → KrutiDev 010 keystrokes
                converted_text = unicode_to_krutidev.unicode_to_krutidev(text)

                exercises_data.append({
                    "id": f"{set_id}-ex{serial}",
                    "setId": set_id,
                    "exerciseNumber": serial,
                    "title": name,
                    "description": f"Practice exercise: {name}",
                    "difficulty": difficulty,
                    "timeLimitMinutes": time_limit,
                    "minWpm": min_wpm,
                    "minAccuracy": min_acc,
                    "maxMarks": max_marks,
                    "passingMarks": passing_marks,
                    "text": converted_text,
                    "textHindi": text,
                    "type": "practice",
                })

            output = {
                "setId": set_id,
                "setName": set_name,
                "totalExercises": len(exercises_data),
                "minWpm": min_wpm,
                "minAccuracy": min_acc,
                "timeLimitMinutes": time_limit,
                "difficulty": difficulty,
                "maxMarks": max_marks,
                "passingMarks": passing_marks,
                "exercises": exercises_data,
            }

            out_dir = self._get_output_dir()
            filename = os.path.join(out_dir, f"{set_id}.json")

            with open(filename, "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)

            messagebox.showinfo(
                "Success",
                f"Generated {len(exercises_data)} exercises!\n\n"
                f"Saved to: src/data/exercises/{set_id}.json\n\n"
                f"The app will load this set automatically on next refresh!"
            )

        except ValueError as ve:
            messagebox.showerror("Validation Error", str(ve))
        except Exception as e:
            messagebox.showerror("Error", f"An unexpected error occurred:\n{str(e)}")


if __name__ == "__main__":
    app = ExerciseBuilderApp()
    app.mainloop()
