# GitHub Upload Steps - AEGIS Project

## STEP 1: Verify .gitignore File

The `.gitignore` file at `C:\AEGIS\.gitignore` should contain ONLY these lines:

```
# Virtual Environments
.conda/
.venv/
venv/
env/
ENV/

# Python Cache
__pycache__/

# Node.js Dependencies
node_modules/

# Build Outputs
build/
dist/

# Environment Variables
.env
```

**✅ This is correct** - it will ignore only build artifacts and dependencies, but will upload:
- All `.xlsx` data files
- All `.joblib` and `.pkl` model files
- All source code
- All documentation

---

## STEP 2: Open PowerShell

1. Press `Windows Key + R`
2. Type: `powershell`
3. Press Enter

---

## STEP 3: Navigate to Project Folder

Copy and paste this command:

```powershell
cd C:\AEGIS
```

Press Enter.

---

## STEP 4: Initialize Git Repository

Copy and paste this command:

```powershell
git init
```

Press Enter.

**Expected output:** `Initialized empty Git repository in C:/AEGIS/.git/`

---

## STEP 5: Add All Files to Git

Copy and paste this command:

```powershell
git add .
```

Press Enter.

**Expected output:** No errors, command completes silently.

**What this does:** Tells Git to track ALL files in your project (except those in .gitignore).

---

## STEP 6: Create Initial Commit

Copy and paste this command:

```powershell
git commit -m "Initial commit: Complete AEGIS project"
```

Press Enter.

**Expected output:** 
```
[main (root-commit) <hash>] Initial commit: Complete AEGIS project
 X files changed, Y insertions(+)
```

**What this does:** Creates a snapshot of all your files.

---

## STEP 7: Create GitHub Repository (if needed)

1. Go to https://github.com
2. Click the **"+"** icon (top right)
3. Click **"New repository"**
4. Repository name: `AEGIS` (or your preferred name)
5. **DO NOT** check "Add a README file"
6. **DO NOT** check "Add .gitignore"
7. **DO NOT** check "Choose a license"
8. Click **"Create repository"**

**Important:** After creating, copy the repository URL shown on the page.
Example: `https://github.com/yourusername/AEGIS.git`

---

## STEP 8: Connect Local Project to GitHub

Replace `YOUR_USERNAME` and `AEGIS` with your actual GitHub username and repository name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/AEGIS.git
```

Press Enter.

**Example:**
```powershell
git remote add origin https://github.com/johnsmith/AEGIS.git
```

**Expected output:** No errors, command completes silently.

---

## STEP 9: Push All Files to GitHub

Copy and paste this command:

```powershell
git push -u origin main
```

Press Enter.

**If you see an error about "main" vs "master", try:**
```powershell
git push -u origin master
```

**Expected output:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), Y MiB, done.
To https://github.com/...
 * [new branch]      main -> main
Branch 'main' set up to track 'origin/main'.
```

**What this does:** Uploads ALL your files to GitHub.

---

## STEP 10: Verify Complete Upload on GitHub

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/AEGIS`
2. Click the **"<> Code"** tab
3. Verify you see ALL these folders:
   - ✅ `Cheseal/`
   - ✅ `Consequence Mirror/`
   - ✅ `Disaster Prediction/`
   - ✅ `uiG/`
   - ✅ `.gitignore` file

4. **Check for data files:**
   - Click into `Disaster Prediction/`
   - You should see: `FloodArchive.xlsx` ✅
   - You should see: `public_emdat_custom_request_*.xlsx` ✅

5. **Check for model files:**
   - Click into `Disaster Prediction/models/saved/`
   - You should see: `*.joblib` files ✅
   - You should see: `*.pkl` files (if any) ✅

6. **Check for source code:**
   - Click into `uiG/src/`
   - You should see: All `.tsx`, `.ts`, `.jsx` files ✅
   - Click into `Disaster Prediction/api/`
   - You should see: All `.py` files ✅

7. **Verify ignored items are NOT present:**
   - You should NOT see: `node_modules/` ✅
   - You should NOT see: `__pycache__/` ✅
   - You should NOT see: `.conda/` ✅
   - You should NOT see: `.venv/` ✅

---

## ⚠️ CRITICAL WARNINGS

### ❌ DO NOT Use Browser Upload
**Problem:** GitHub's "Upload files" button has a 100-file limit per upload.
**Result:** Only some files upload, project is incomplete and broken.
**Solution:** Always use Git commands (Step 9 above).

### ❌ DO NOT Initialize Repository with README
**Problem:** Creates a conflict when pushing your existing files.
**Result:** Requires merge resolution, complicates first upload.
**Solution:** Create empty repository (Step 7).

### ❌ DO NOT Use "Add file" → "Upload files"
**Problem:** Limited to 100 files, cannot upload entire project structure.
**Result:** Missing files, incomplete project.
**Solution:** Use Git commands only.

---

## 🔍 How to Verify Project is Complete

### Quick Check:
1. Count folders on GitHub - should match your local `C:\AEGIS` folder
2. Check file sizes - large `.joblib` and `.xlsx` files should be visible
3. Check repository size - should be substantial (not tiny)

### Detailed Check:
1. **Data Files Present:**
   - `Disaster Prediction/FloodArchive.xlsx` ✅
   - `Disaster Prediction/public_emdat_*.xlsx` ✅
   - CSV files in `data/disasters/` and `data/diseases/` ✅

2. **Model Files Present:**
   - `Disaster Prediction/models/saved/*.joblib` ✅
   - All model files visible ✅

3. **Source Code Present:**
   - All `.py` files in `api/`, `cheseal/`, `data/`, `models/` ✅
   - All `.tsx`, `.ts`, `.jsx` files in `uiG/src/` ✅
   - All configuration files (`package.json`, `requirements.txt`) ✅

4. **Documentation Present:**
   - All `.md` files visible ✅

---

## 📋 Complete Command Sequence (Copy All at Once)

If you want to run all commands in sequence, here they are:

```powershell
cd C:\AEGIS
git init
git add .
git commit -m "Initial commit: Complete AEGIS project"
git remote add origin https://github.com/YOUR_USERNAME/AEGIS.git
git push -u origin main
```

**Remember to replace:**
- `YOUR_USERNAME` with your GitHub username
- `AEGIS` with your repository name (if different)

---

## ✅ Success Indicators

After Step 9 completes successfully, you should see:

- ✅ All commands executed without errors
- ✅ Repository shows all folders on GitHub
- ✅ Data files (`.xlsx`) are visible
- ✅ Model files (`.joblib`) are visible
- ✅ Source code files are visible
- ✅ Repository size is substantial (not just a few KB)

---

## 🆘 If Something Goes Wrong

### Error: "fatal: remote origin already exists"
**Fix:**
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/AEGIS.git
```

### Error: "Authentication failed"
**Fix:** GitHub requires a Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permission
3. Use token as password when prompted

### Error: "failed to push some refs"
**Fix:** If GitHub repo has files, force push (use carefully):
```powershell
git push -u origin main --force
```

---

**That's it!** Your complete project (including data and models) is now on GitHub. 🎉
