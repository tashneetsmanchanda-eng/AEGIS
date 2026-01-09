# GitHub Upload Guide for AEGIS Project

## 📋 Step-by-Step Instructions

### STEP 1: Create .gitignore File

A `.gitignore` file has been created at the root of your project (`C:\AEGIS\.gitignore`).

This file tells Git to **ignore** (not upload) these types of files:
- `node_modules/` (JavaScript dependencies - can be reinstalled)
- `__pycache__/` (Python cache files)
- `conda/` (Conda environment)
- `*.joblib` (ML model files - very large)
- `*.xlsx` (Excel files - large data files)
- Build artifacts and temporary files

**✅ This is correct** - you don't want to upload these large/generated files.

---

### STEP 2: Open Terminal in Project Root

1. Press `Windows Key + R`
2. Type: `powershell`
3. Press Enter
4. Navigate to your project:
   ```powershell
   cd C:\AEGIS
   ```

---

### STEP 3: Initialize Git Repository

Run this command to initialize Git in your project:

```powershell
git init
```

**What this does:** Creates a hidden `.git` folder that tracks your files.

---

### STEP 4: Check Git Status (Optional - to see what will be uploaded)

```powershell
git status
```

**What you'll see:**
- Files in **red** = not tracked yet (will be uploaded)
- Files in **green** = already tracked
- Files **not shown** = ignored by .gitignore (correct!)

---

### STEP 5: Add All Files to Git

```powershell
git add .
```

**What this does:** Tells Git to track all files (except those in .gitignore).

**Expected output:** No errors, command completes silently.

---

### STEP 6: Create Initial Commit

```powershell
git commit -m "Initial commit: AEGIS project"
```

**What this does:** Creates a snapshot of all your files.

**Expected output:** 
```
[main (or master) <commit-hash>] Initial commit: AEGIS project
 X files changed, Y insertions(+)
```

---

### STEP 7: Create GitHub Repository (if you haven't already)

1. Go to https://github.com
2. Click the **"+"** icon (top right)
3. Click **"New repository"**
4. Repository name: `AEGIS` (or any name you prefer)
5. **DO NOT** check "Initialize with README" (you already have files)
6. Click **"Create repository"**

**Important:** Copy the repository URL shown (e.g., `https://github.com/yourusername/AEGIS.git`)

---

### STEP 8: Connect Local Repository to GitHub

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub username and repository name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**Example:**
```powershell
git remote add origin https://github.com/johnsmith/AEGIS.git
```

**What this does:** Links your local project to the GitHub repository.

---

### STEP 9: Push All Files to GitHub

```powershell
git push -u origin main
```

**Note:** If you see an error about "main" vs "master", try:
```powershell
git push -u origin master
```

**What this does:** Uploads all your files to GitHub.

**Expected output:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/...
 * [new branch]      main -> main
```

---

### STEP 10: Verify Upload on GitHub

1. Go to your GitHub repository page
2. Click on the **"<> Code"** tab
3. You should see all your folders:
   - ✅ `Cheseal/`
   - ✅ `Consequence Mirror/`
   - ✅ `Disaster Prediction/`
   - ✅ `uiG/`
   - ✅ All `.md` files
   - ✅ All source code files

**How to verify completeness:**
- Click into each major folder
- Check that subfolders are present
- Check that source files (`.py`, `.tsx`, `.ts`, `.jsx`) are visible
- **You should NOT see:** `node_modules/`, `__pycache__/`, `conda/` (these are correctly ignored)

---

## ⚠️ Common Mistakes to Avoid

### ❌ DO NOT Use Browser Upload
- **Problem:** GitHub's "Upload files" button has a 100-file limit
- **Result:** Only some files upload, project is incomplete
- **Solution:** Always use Git commands (Step 9)

### ❌ DO NOT Upload node_modules
- **Problem:** `node_modules/` can be 100MB+ and is unnecessary
- **Result:** Slow upload, repository bloat
- **Solution:** `.gitignore` already handles this ✅

### ❌ DO NOT Upload ML Model Files
- **Problem:** `.joblib` files are very large (100MB+ each)
- **Result:** Repository becomes huge, slow to clone
- **Solution:** `.gitignore` already handles this ✅

### ❌ DO NOT Initialize Repository with README
- **Problem:** Creates a conflict when pushing
- **Result:** Requires merge resolution
- **Solution:** Create empty repository (Step 7)

---

## 🔍 Troubleshooting

### Error: "fatal: remote origin already exists"
**Solution:**
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Error: "failed to push some refs"
**Solution:** This usually means the GitHub repo has files. Force push (use carefully):
```powershell
git push -u origin main --force
```

### Error: Authentication required
**Solution:** GitHub now requires a Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when prompted

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] All major folders visible on GitHub
- [ ] Source code files (`.py`, `.tsx`, `.ts`) are present
- [ ] `node_modules/` is NOT visible (correctly ignored)
- [ ] `__pycache__/` is NOT visible (correctly ignored)
- [ ] `.gitignore` file is present in repository
- [ ] README files are visible
- [ ] No error messages during push

---

## 📊 Expected Repository Structure on GitHub

```
AEGIS/
├── .gitignore
├── Cheseal/
│   ├── *.py files
│   └── *.md files
├── Consequence Mirror/
│   ├── backend/
│   ├── src/
│   └── *.md files
├── Disaster Prediction/
│   ├── api/
│   ├── data/
│   ├── models/
│   └── *.py files
├── uiG/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── *.tsx, *.ts files
│   └── package.json
└── *.md files (documentation)
```

**Note:** `node_modules/`, `__pycache__/`, `conda/`, `*.joblib`, `*.xlsx` will NOT appear (this is correct).

---

## 🎯 Quick Reference: All Commands in Order

```powershell
cd C:\AEGIS
git init
git add .
git commit -m "Initial commit: AEGIS project"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `REPO_NAME` with your actual values.

---

**That's it!** Your entire project is now on GitHub. 🎉
